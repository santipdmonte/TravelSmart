from django.db import models

# --- Modelos de Catálogo y Entidades Principales ---

class Destination(models.Model):
    city_name = models.CharField(max_length=100)
    country_name = models.CharField(max_length=100)
    region = models.CharField(max_length=100, null=True, blank=True)
    timezone = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return f"{self.city_name}, {self.country_name}"

class Itinerary(models.Model):
    class Visibility(models.TextChoices):
        PRIVATE = 'private', 'Private'
        UNLISTED = 'unlisted', 'Unlisted'
        PUBLIC = 'public', 'Public'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        CONFIRMED = 'confirmed', 'Confirmed'

    session_id = models.CharField(max_length=40, db_index=True) # db_index para búsquedas más rápidas
    details_itinerary = models.JSONField(null=True, blank=True)
    trip_name = models.CharField(max_length=200)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.PRIVATE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.trip_name

# --- Modelos de Detalle del Itinerario ---

class ItineraryDestination(models.Model):
    itinerary = models.ForeignKey(Itinerary, related_name='destinations', on_delete=models.CASCADE)
    destination = models.ForeignKey(Destination, on_delete=models.PROTECT)
    days_in_destination = models.PositiveIntegerField()
    destination_order = models.PositiveIntegerField()

class Day(models.Model):
    itinerary_destination = models.ForeignKey(ItineraryDestination, related_name='days', on_delete=models.CASCADE)
    day_number = models.PositiveIntegerField()
    date = models.DateField()

class Activity(models.Model):
    day = models.ForeignKey(Day, related_name='activities', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_order = models.PositiveIntegerField()
    details_activity = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)