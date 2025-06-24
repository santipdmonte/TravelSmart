from rest_framework import serializers
from .models import Itinerary, ItineraryDestination, Day, Activity, Destination


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['name', 'description', 'activity_order', 'details_activity']

class DaySerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Day
        fields = ['day_number', 'date', 'activities']

class ItineraryDestinationSerializer(serializers.ModelSerializer):
    days = DaySerializer(many=True, read_only=True)
    destination_name = serializers.CharField(source='destination.city_name', read_only=True)
    country_name = serializers.CharField(source='destination.country_name', read_only=True)

    class Meta:
        model = ItineraryDestination
        fields = [
            'destination_name', 'country_name', 'days_in_destination', 
            'destination_order', 'days'
        ]

# --- Serializer Principal ---

class ItineraryDetailSerializer(serializers.ModelSerializer):
    destinations = ItineraryDestinationSerializer(many=True, read_only=True)

    class Meta:
        model = Itinerary
        fields = [
            'id', 'trip_name', 'visibility', 'status',
            'created_at', 'updated_at',
            'details_itinerary',  # Incluimos el JSON blob
            'destinations'        # Incluimos la estructura relacional
        ]

class ItineraryGenerateSerializer(serializers.Serializer):
    # Este serializer es solo para validar la entrada del endpoint de generación
    trip_name = serializers.CharField(max_length=200, required=True)
    days = serializers.IntegerField(required=True, min_value=1) 