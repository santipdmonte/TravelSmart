from django.urls import path
from . import views

urlpatterns = [
    # Usamos 'itineraries' como el recurso principal, es una mejor práctica REST
    path('private/', views.private_endpoint, name='private_endpoint'),
    path('generate/', views.itinerary_generate, name='itinerary-generate'),
    path('<int:pk>/', views.itinerary_detail, name='itinerary-detail'),
    path('<int:pk>/modify/', views.itinerary_modify, name='itinerary-modify'),
]