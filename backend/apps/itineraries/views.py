import json
from pydantic.json import pydantic_encoder
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from django.utils import timezone

from .models import Itinerary, Destination, ItineraryDestination, Day, Activity
from .serializers import ItineraryDetailSerializer, ItineraryGenerateSerializer
from .services import (
    generate_itinerary_service,
    initialize_agent_service,
    user_response_service,
    user_HIL_response_service,
    get_state_service
)

# Importamos el Pydantic model que el servicio espera
from .graph.state import ViajeStateInput


class ItineraryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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


class ItineraryDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Itinerary.objects.get(pk=pk, deleted_at__isnull=True)
        except Itinerary.DoesNotExist:
            return None

    def get(self, request, pk):
        itinerary = self.get_object(pk)
        if not itinerary:
            return Response({"error": "Not found"}, status=404)
        serializer = ItineraryDetailSerializer(itinerary)
        return Response(serializer.data)

    def put(self, request, pk):
        """
        Recibe el estado final de un itinerario desde el frontend (después de la
        edición con el agente) y lo persiste en la base de datos, reemplazando
        la versión anterior.
        """
        try:
            itinerary = Itinerary.objects.get(pk=pk, deleted_at__isnull=True)
        except Itinerary.DoesNotExist:
            return Response({"error": "Itinerary not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Obtenemos el JSON del itinerario final desde el body de la petición
        final_itinerary_json = request.data.get('itinerary_final_state')
        
        if not final_itinerary_json:
            return Response({"error": "No final itinerary state provided in request body."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. "Brute-force update": Borramos los detalles relacionales antiguos del itinerario
        #    Esto asegura una actualización limpia.
        itinerary.destinations.all().delete()

        # 3. Llenamos las tablas con los datos del nuevo JSON
        #    (Usando la misma lógica de parseo robusta que ya funciona en 'generate')
        for dest_order, dest_data in enumerate(final_itinerary_json.get('destinos', [])):
            if not dest_data.get('dias_destino'):
                continue

            raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
            city_parts = raw_destination_name.split(',')
            city = city_parts[0].strip()
            country = city_parts[1].strip() if len(city_parts) > 1 else final_itinerary_json.get('destino_general', '')

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
                    activity_list = [act.strip() for act in activities_data.split('.') if act.strip()]
                elif isinstance(activities_data, list):
                    activity_list = activities_data
                
                for act_order, act_data in enumerate(activity_list):
                    activity_name = ""
                    activity_description = ""
                    if isinstance(act_data, dict):
                        activity_name = act_data.get('nombre', '')
                        activity_description = act_data.get('descripcion', '')
                    elif isinstance(act_data, str):
                        activity_name = act_data
                    
                    if activity_name:
                        Activity.objects.create(
                            day=day, 
                            name=activity_name,
                            description=activity_description,
                            activity_order=act_order + 1
                        )
        
        # 4. Actualizamos el itinerario principal con los nuevos datos
        itinerary.details_itinerary = final_itinerary_json
        itinerary.trip_name = final_itinerary_json.get('nombre_viaje', itinerary.trip_name)
        itinerary.save()
        
        # 5. Devolvemos el itinerario actualizado desde la base de datos
        itinerary.refresh_from_db()
        response_serializer = ItineraryDetailSerializer(itinerary)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        itinerary = self.get_object(pk)
        if not itinerary:
            return Response({"error": "Not found"}, status=404)
        itinerary.deleted_at = timezone.now()
        itinerary.save()
        return Response(status=204)

# --- Vistas de la API para el grafo de IA ---

class AgentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, config_id):
        thread_id = request.data.get('thread_id')
        itinerary_state = request.data.get('itinerary_state')
        response = initialize_agent_service(thread_id=thread_id, itinerary_state=itinerary_state)
        return Response(response)

    def get(self, request, config_id):
        thread_id = request.query_params.get('thread_id')
        response = get_state_service(thread_id=thread_id)
        return Response(response)


class AgentMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, config_id):
        thread_id = request.data.get('thread_id')
        user_response_data = request.data.get('user_response')
        user_hil_response_data = request.data.get('user_HIL_response')

        # Combina user_response o hil_response según cuál venga
        if user_response_data:
            response = user_response_service(thread_id=thread_id, user_response=user_response_data)
        elif user_hil_response_data:
            response = user_HIL_response_service(thread_id=thread_id, user_HIL_response=user_hil_response_data)
        else:
            return Response({"error": "No response provided"}, status=400)

        return Response(response)