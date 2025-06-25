from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone


from .models import Itinerary, Destination, ItineraryDestination, Day, Activity
from .serializers import ItineraryDetailSerializer, ItineraryGenerateSerializer
from .ai_service import generate_itinerary_from_ai

# --- Endpoint de prueba de Autenticación ---

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Aseguramos que solo usuarios autenticados entren
def private_endpoint(request):
    """
    Endpoint privado para verificar que la autenticación con Auth0 funciona.
    """
    # El payload del token está en request.auth gracias a nuestra clase de autenticación
    auth0_user_id = request.auth.get('sub') 
    message = f"Hola usuario {auth0_user_id}! Este es un mensaje privado desde el backend de Django."
    return Response({'message': message})


# --- Lógica de IA (Mockup) ---


# def call_ai_to_generate_itinerary(trip_name):
    print(f"Llamando a la IA para generar el viaje: {trip_name}")
    # En un futuro, aquí llamarías a tu servicio de IA.
    # Por ahora, devolvemos un JSON de ejemplo bien estructurado.
    return {
        "destinations": [
            {
                "destination_city": "Roma",
                "destination_country": "Italia",
                "days_in_destination": 1,
                "days": [
                    {
                        "day_number": 1, "date": "2025-10-10",
                        "activities": [
                            {"name": "Visitar el Coliseo", "description": "Antiguo anfiteatro romano.", "order": 1, "details": {"cost": 20}},
                            {"name": "Paseo por el Foro Romano", "description": "Corazón de la antigua Roma.", "order": 2, "details": {"cost": 15}}
                        ]
                    }
                ]
            }
        ]
    }

def call_ai_to_modify_itinerary(itinerary_json, prompt):
    print(f"Llamando a la IA para modificar el itinerario con el prompt: '{prompt}'")
    # En un futuro, la IA modificaría el JSON que le pasas.
    # Por ahora, para simular un cambio, simplemente cambiamos un nombre.
    new_json = itinerary_json.copy()
    new_json['destinations'][0]['days'][0]['activities'][0]['name'] = "Visita MODIFICADA al Coliseo"
    return new_json

# --- Vistas de la API para Itinerarios ---

@api_view(['POST'])
@permission_classes([AllowAny])
def itinerary_generate(request):
    """
    Endpoint para generar un nuevo itinerario usando el servicio de IA.
    """
    serializer = ItineraryGenerateSerializer(data=request.data)
    if serializer.is_valid():
        trip_name = serializer.validated_data['trip_name']
        days = serializer.validated_data['days']
        
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        ai_response_json = generate_itinerary_from_ai(trip_name=trip_name, days=days)

        if not ai_response_json:
            return Response(
                {"error": "Failed to generate itinerary from AI service."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        itinerary = Itinerary.objects.create(
            trip_name=trip_name,
            session_id=session_id,
            details_itinerary=ai_response_json
        )
        
        # --- INICIO DE LA LÓGICA DE PARSEO FINAL ---
        for dest_order, dest_data in enumerate(ai_response_json.get('destinos', [])):
            
            if not dest_data.get('dias_destino'):
                continue

            raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
            city_parts = raw_destination_name.split(',')
            
            city = city_parts[0].strip()
            # Si el JSON no especifica un país, usamos el nombre del viaje como país por defecto.
            country = city_parts[1].strip() if len(city_parts) > 1 else itinerary.trip_name

            # Usamos get_or_create para evitar duplicados en la tabla de Destinos
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
                
                for act_order, act_data in enumerate(day_data.get('actividades', [])):
                    activity_name = ""
                    activity_description = ""
                    activity_details = {}

                    if isinstance(act_data, dict):
                        activity_name = act_data.get('nombre', 'Actividad sin nombre')
                        activity_description = act_data.get('descripcion', '')
                        activity_details = act_data.get('details', {})
                    elif isinstance(act_data, str):
                        activity_name = act_data
                        activity_description = ''
                    
                    if activity_name:
                        Activity.objects.create(
                            day=day, 
                            name=activity_name,
                            description=activity_description,
                            activity_order=int(act_order) + 1,
                            details_activity=activity_details
                        )
        # --- FIN DE LA LÓGICA DE PARSEO FINAL ---
        
        response_serializer = ItineraryDetailSerializer(itinerary)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
@permission_classes([AllowAny]) # Cambiar a IsAuthenticated cuando se implemente la lógica de usuarios
def itinerary_modify(request, pk):
    """
    Endpoint para modificar un itinerario existente usando la estrategia híbrida.
    """
    try:
        # Obtenemos el itinerario que no esté marcado como borrado
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
    itinerary.destinations.all().delete() # Esto borra en cascada los Days y Activities

    # 4. Llenamos las tablas relacionales con la nueva respuesta de la IA
    for dest_order, dest_data in enumerate(new_itinerary_json.get('destinations', [])):
        destination, _ = Destination.objects.get_or_create(
            city_name=dest_data.get('destination_city'),
            country_name=dest_data.get('destination_country')
        )
        it_dest = ItineraryDestination.objects.create(
            itinerary=itinerary, destination=destination,
            days_in_destination=dest_data.get('days_in_destination', 0),
            destination_order=dest_order + 1
        )
        for day_data in dest_data.get('days', []):
            day = Day.objects.create(
                itinerary_destination=it_dest,
                day_number=day_data.get('day_number'),
                date=day_data.get('date')
            )
            for act_data in day_data.get('activities', []):
                Activity.objects.create(
                    day=day, name=act_data.get('name'),
                    description=act_data.get('description', ''),
                    activity_order=act_data.get('order'),
                    details_activity=act_data.get('details', {})
                )
    
    # 5. Actualizamos el campo JSON y la fecha de modificación en el itinerario principal
    itinerary.details_itinerary = new_itinerary_json
    itinerary.save() # Esto actualiza el campo `updated_at`

    # 6. Devolvemos el itinerario actualizado
    response_serializer = ItineraryDetailSerializer(itinerary)
    return Response(response_serializer.data, status=status.HTTP_200_OK)