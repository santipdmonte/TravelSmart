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
    get_state_service,
    create_itinerary_from_ia
)

# Importamos el Pydantic model que el servicio espera
from .graph.state import ViajeStateInput


class ItineraryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Endpoint para generar un nuevo itinerario.
        Ahora solo valida y llama a la capa de servicio.
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
            # Llamamos a nuestro único servicio que hace todo el trabajo
            itinerary = create_itinerary_from_ia(
                trip_name=trip_name,
                days=days,
                session_id=session_id
            )
            
            # Serializamos la respuesta y la devolvemos
            response_serializer = ItineraryDetailSerializer(itinerary)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Capturamos cualquier error que el servicio pueda lanzar
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

class AgentInitializeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk, thread_id):

        itinerary = Itinerary.objects.get(pk=pk, deleted_at__isnull=True)
        itinerary_state = itinerary.details_itinerary

        response = initialize_agent_service(thread_id=thread_id, itinerary_state=itinerary_state)
        return Response(response)


class AgentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, thread_id):
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

    def get(self, request, thread_id):
        response = get_state_service(thread_id=thread_id)
        return Response(response)