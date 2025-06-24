from django.urls import path
from . import views

# /api/itineraries/
urlpatterns = [
    path('private/', views.private_endpoint, name='private_endpoint'),
    path('generate/', views.itinerary_generate, name='itinerary-generate'),
    path('<int:pk>/', views.itinerary_detail, name='itinerary-detail'),
    path('<int:pk>/modify/', views.itinerary_modify, name='itinerary-modify'),
    path('agent/initialize', views.initialize_agent, name='initialize_agent'),
    path('agent/user_response', views.user_response, name='user_response'),
    path('agent/HIL_response', views.HIL_response, name='HIL_response'),
    path('agent/get_state', views.get_state, name='get_state'),
]