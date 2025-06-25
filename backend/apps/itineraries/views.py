import json
from pydantic.json import pydantic_encoder
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone

from .models import Itinerary, Destination, ItineraryDestination, Day, Activity
from .serializers import ItineraryDetailSerializer, ItineraryGenerateSerializer
from .services import (
    call_ai_to_modify_itinerary,
    generate_itinerary_service,
    initialize_agent_service,
    user_response_service,
    user_HIL_response_service,
    get_state_service
)

# Importamos el Pydantic model que el servicio espera
from .graph.state import ViajeStateInput

@api_view(['POST'])
@permission_classes([AllowAny])
def itinerary_generate(request):
    """
    Endpoint para generar un nuevo itinerario usando el servicio de IA.
    """
    serializer = ItineraryGenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    trip_name = validated_data['trip_name']
    days = validated_data['days']
    
    session_id = request.session.session_key
    if not session_id:
        request.session.create()
        session_id = request.session.session_key

    try:
        input_state = ViajeStateInput(nombre_viaje=trip_name, cantidad_dias=days)
    except Exception as e:
        return Response({"error": f"Invalid input data for Pydantic model: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    # La IA devuelve un objeto híbrido (dict-like con objetos Pydantic dentro)
    ai_response_object = generate_itinerary_service(input_state)

    if not ai_response_object:
        return Response({"error": "Failed to generate itinerary from AI service."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Convertimos el objeto complejo a un string JSON usando el codificador de Pydantic.
    json_string = json.dumps(ai_response_object, default=pydantic_encoder)
    # Convertimos ese string de vuelta a un diccionario de Python puro.
    ai_response_dict = json.loads(json_string)

    # Ahora 'ai_response_dict' es un diccionario 100% seguro para Django y la base de datos.
    itinerary = Itinerary.objects.create(
        trip_name=trip_name,
        session_id=session_id,
        details_itinerary=ai_response_dict
    )

    # Y también usamos el diccionario para el parsing de las tablas relacionales
    for dest_order, dest_data in enumerate(ai_response_dict.get('destinos', [])):
        if not dest_data.get('dias_destino'):
            continue

        raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
        city_parts = raw_destination_name.split(',')
        
        city = city_parts[0].strip()
        country = city_parts[1].strip() if len(city_parts) > 1 else itinerary.trip_name

        destination, _ = Destination.objects.get_or_create(
            city_name=city,
            country_name=country
        )
        
        it_dest = ItineraryDestination.objects.create(
            itinerary=itinerary, 
            destination=destination,
            days_in_destination=dest_data.get('cantidad_dias_en_destino', 0),
            destination_order=dest_order + 1
        )
        
        for day_data in dest_data.get('dias_destino', []):
            day = Day.objects.create(
                itinerary_destination=it_dest,
                day_number=day_data.get('posicion_dia'),
                date=None
            )
            
            activities_data = day_data.get('actividades', [])
            activity_list = []

            if isinstance(activities_data, str):
                # Si la IA devuelve un solo texto, lo separamos por frases (puntos).
                # Filtramos las cadenas vacías que puedan resultar del split.
                activity_list = [act.strip() for act in activities_data.split('.') if act.strip()]
            elif isinstance(activities_data, list):
                # Si devuelve una lista (como en el caso ideal), la usamos directamente.
                activity_list = activities_data

            for act_order, act_data in enumerate(activity_list):
                activity_name = ""
                activity_description = ""

                if isinstance(activities_data, list) and len(activities_data) > 0:
                # Comprobamos el primer elemento para ver si es un objeto o un texto
                    first_item = activities_data[0]
                    if isinstance(first_item, dict) and 'nombre' in first_item:
                        # CASO 1: La IA devuelve una lista de objetos (el caso ideal)
                        long_activity_string = first_item.get('nombre', '')
                        # Dividimos el string largo por comas
                        activity_list = [act.strip() for act in long_activity_string.split(',') if act.strip()]
                    else:
                        # CASO 2: La IA devuelve una lista de strings
                        activity_list = activities_data
            
                for act_order, activity_name in enumerate(activity_list):
                    # Ahora 'activity_name' siempre es un string individual
                    if activity_name:
                        Activity.objects.create(
                            day=day, 
                            name=activity_name,
                            description='', # La descripción está vacía en este formato
                            activity_order=act_order + 1,
                            details_activity={}
                        )
    
    # Usamos .refresh_from_db() para asegurarnos de que el serializer obtenga las relaciones anidadas
    itinerary.refresh_from_db()
    response_serializer = ItineraryDetailSerializer(itinerary)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'DELETE']) 
@permission_classes([AllowAny])
def itinerary_detail(request, pk):
    try:
        itinerary = Itinerary.objects.get(pk=pk, deleted_at__isnull=True)
    except Itinerary.DoesNotExist:
        return Response({"error": "Itinerary not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Si la petición es GET, devolvemos los detalles
        serializer = ItineraryDetailSerializer(itinerary)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        # Si la petición es DELETE, hacemos el soft delete
        itinerary.deleted_at = timezone.now() # Fecha de borrado
        itinerary.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([AllowAny])
def itinerary_modify(request, pk):
    """
    Endpoint para modificar un itinerario existente usando la estrategia híbrida.
    """
    try:
        itinerary = Itinerary.objects.get(pk=pk, deleted_at__isnull=True)
    except Itinerary.DoesNotExist:
        return Response({"error": "Itinerary not found"}, status=status.HTTP_404_NOT_FOUND)

    prompt = request.data.get('prompt')
    if not prompt:
        return Response({"error": "A 'prompt' for modification is required."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Tomamos el JSON guardado en la base de datos
    current_itinerary_json = itinerary.details_itinerary

    # 2. Llamamos a la IA con el JSON actual y el prompt
    new_itinerary_json = call_ai_to_modify_itinerary(current_itinerary_json, prompt)

    # 3. "Brute-force update": Borramos los detalles antiguos del itinerario
    #    Usamos related_name='destinations' que definimos en el modelo Itinerary
    itinerary.destinations.all().delete() 

    # 4. Llenamos las tablas relacionales con la nueva respuesta de la IA
    #    (Usando la misma lógica de parseo corregida que en 'generate')
    for dest_order, dest_data in enumerate(new_itinerary_json.get('destinos', [])):
        if not dest_data.get('dias_destino'):
            continue

        raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
        city_parts = raw_destination_name.split(',')
        city = city_parts[0].strip()
        country = city_parts[1].strip() if len(city_parts) > 1 else itinerary.trip_name

        destination, _ = Destination.objects.get_or_create(
            city_name=city, country_name=country
        )
        
        it_dest = ItineraryDestination.objects.create(
            itinerary=itinerary, 
            destination=destination,
            days_in_destination=dest_data.get('cantidad_dias_en_destino', 0),
            destination_order=dest_order + 1
        )
        for day_data in dest_data.get('dias_destino', []):
            day = Day.objects.create(
                itinerary_destination=it_dest,
                day_number=day_data.get('posicion_dia'),
                date=None
            )
            activities_data = day_data.get('actividades', [])
            activity_list = []

            if isinstance(activities_data, str):
                # Si la IA devuelve un solo texto, lo separamos por frases (puntos).
                # Filtramos las cadenas vacías que puedan resultar del split.
                activity_list = [act.strip() for act in activities_data.split('.') if act.strip()]
            elif isinstance(activities_data, list):
                # Si devuelve una lista (como en el caso ideal), la usamos directamente.
                activity_list = activities_data

            for act_order, act_data in enumerate(activity_list):
                activity_name = ""
                activity_description = ""

                if isinstance(activities_data, list) and len(activities_data) > 0:
                # Comprobamos el primer elemento para ver si es un objeto o un texto
                    first_item = activities_data[0]
                    if isinstance(first_item, dict) and 'nombre' in first_item:
                        # CASO 1: La IA devuelve una lista de objetos (el caso ideal)
                        long_activity_string = first_item.get('nombre', '')
                        # Dividimos el string largo por comas
                        activity_list = [act.strip() for act in long_activity_string.split(',') if act.strip()]
                    else:
                        # CASO 2: La IA devuelve una lista de strings
                        activity_list = activities_data
            
                for act_order, activity_name in enumerate(activity_list):
                    # Ahora 'activity_name' siempre es un string individual
                    if activity_name:
                        Activity.objects.create(
                            day=day, 
                            name=activity_name,
                            description='', # La descripción está vacía en este formato
                            activity_order=act_order + 1,
                            details_activity={}
                        )
    
    # 5. Actualizamos el campo JSON y la fecha en el itinerario principal
    itinerary.details_itinerary = new_itinerary_json
    itinerary.save() # Esto actualiza el campo `updated_at`
    
    # 6. Devolvemos el itinerario actualizado
    itinerary.refresh_from_db()
    response_serializer = ItineraryDetailSerializer(itinerary)
    return Response(response_serializer.data, status=status.HTTP_200_OK)


# --- Vistas de la API para el grafo de IA ---

from .services import (
    initialize_agent_service,
    user_response_service,
    user_HIL_response_service,
    get_state_service
)

@api_view(['POST'])
@permission_classes([AllowAny])
def initialize_agent(request):
    """
    Endpoint to initialize the graph.
    """

    # Get the input data
    # TODO: Serialize the data
    thread_id = request.data.get('thread_id')
    itinerary_state = request.data.get('itinerary_state')

    # Call the AI service
    graph_response = initialize_agent_service(thread_id=thread_id, itinerary_state=itinerary_state)

    return Response(graph_response, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def user_response(request):
    """
    Endpoint to handle user response.
    """

    # Get the input data
    # TODO: Serialize the data
    thread_id = request.data.get('thread_id')
    user_response_data = request.data.get('user_response')

    # Call the AI service
    response = user_response_service(thread_id=thread_id, user_response=user_response_data)

    return Response(response, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def HIL_response(request):
    """
    Endpoint to handle HIL response.
    """

    # Get the input data
    # TODO: Serialize the data
    thread_id = request.data.get('thread_id')
    user_HIL_response_data = request.data.get('user_HIL_response')

    # Call the AI service
    response = user_HIL_response_service(thread_id=thread_id, user_HIL_response=user_HIL_response_data)

    return Response(response, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_state(request):
    """
    Endpoint to get the state of the graph.
    """

    # Get the input data
    thread_id = request.query_params.get('thread_id')

    # Call the AI service
    response = get_state_service(thread_id=thread_id)

    return Response(response, status=status.HTTP_200_OK)