import json
from pydantic.json import pydantic_encoder
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from langchain_core.runnables import RunnableConfig
from .graph.itinerary_agent import itinerary_agent
from .graph.utils import detect_hil_mode
from django.utils import timezone

from .models import Itinerary, Destination, ItineraryDestination, Day, Activity
from .serializers import ItineraryDetailSerializer, ItineraryGenerateSerializer
from .services import (
    generate_itinerary_service,
    initialize_agent_service,
    user_response_service,
    get_state_service,
    create_itinerary_from_ia
)

# Importamos el Pydantic model que el servicio espera
from .graph.state import ViajeStateInput


class ItineraryCreateView(generics.CreateAPIView):
    """
    Maneja la creación (POST) de un nuevo Itinerario.
    Usa un serializer para la entrada y otro para la salida.
    """
    serializer_class = ItineraryGenerateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # 1. Validamos la data de entrada con el serializer de generación
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        # 2. Obtenemos el session_id
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        # 3. Llamamos a nuestro servicio para crear el objeto en la base de datos
        try:
            itinerary = create_itinerary_from_ia(
                trip_name=validated_data['trip_name'],
                days=validated_data['days'],
                session_id=session_id
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Para la RESPUESTA, usamos el serializer de DETALLE, que sí sabe
        #    cómo mostrar un objeto Itinerary completo.
        output_serializer = ItineraryDetailSerializer(itinerary)
        
        # 5. Devolvemos la respuesta formateada correctamente
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ItineraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Maneja GET (obtener), PUT/PATCH (actualizar), y DELETE (borrado lógico)
    para un Itinerario específico, de forma automática.
    """
    queryset = Itinerary.objects.filter(deleted_at__isnull=True)
    serializer_class = ItineraryDetailSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        """
        Sobrescribe el método de borrado para implementar el 'soft delete'.
        """
        instance.deleted_at = timezone.now()
        instance.save()

class ItineraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Maneja GET, PUT/PATCH, y DELETE para un Itinerario.
    El método 'update' ha sido sobrescrito para nuestra lógica custom.
    """
    queryset = Itinerary.objects.filter(deleted_at__isnull=True)
    serializer_class = ItineraryDetailSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.deleted_at = timezone.now()
        instance.save()

    def update(self, request, *args, **kwargs):
        """
        Sobrescribimos el método 'update' completo para manejar nuestra lógica
        personalizada sin pasar por la validación automática del serializer.
        """
        # Obtenemos la instancia del itinerario que se va a modificar
        itinerary = self.get_object() 
        
        # Obtenemos el JSON del itinerario final desde el body de la petición
        final_itinerary_json = request.data.get('itinerary_final_state')
        
        if not final_itinerary_json:
            return Response({"error": "No final itinerary state provided in request body."}, status=status.HTTP_400_BAD_REQUEST)

        # "Brute-force update": Borramos los detalles relacionales antiguos
        itinerary.destinations.all().delete()

        # Llenamos las tablas con los datos del nuevo JSON (lógica que ya funciona)
        for dest_order, dest_data in enumerate(final_itinerary_json.get('destinos', [])):
            if not dest_data.get('dias_destino'):
                continue

            raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
            city_parts = raw_destination_name.split(',')
            city = city_parts[0].strip()
            country = city_parts[1].strip() if len(city_parts) > 1 else final_itinerary_json.get('destino_general', '')

            destination, _ = Destination.objects.get_or_create(
                city_name=city,
                defaults={'country_name': country}
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
                    if isinstance(act_data, dict):
                        activity_name = act_data.get('nombre', '')
                    elif isinstance(act_data, str):
                        activity_name = act_data
                    
                    if activity_name:
                        Activity.objects.create(
                            day=day, 
                            name=activity_name,
                            description='',
                            activity_order=act_order + 1
                        )

        # Actualizamos el itinerario principal
        itinerary.details_itinerary = final_itinerary_json
        itinerary.trip_name = final_itinerary_json.get('nombre_viaje', itinerary.trip_name)
        itinerary.save()
        
        # Devolvemos el itinerario actualizado usando el serializer
        serializer = self.get_serializer(itinerary)
        return Response(serializer.data)

        # Guardamos el JSON crudo y actualizamos el nombre
        itinerary.details_itinerary = final_itinerary_json
        itinerary.trip_name = final_itinerary_json.get('nombre_viaje', itinerary.trip_name)
        itinerary.save()


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

        # Validación mejorada de user_response_data
        if not user_response_data:
            return Response({"error": "No response provided"}, status=400)

        response = user_response_service(thread_id=thread_id, user_response=user_response_data)

        return Response(response)

    def get(self, request, thread_id):
        response = get_state_service(thread_id=thread_id)

        return Response(response)