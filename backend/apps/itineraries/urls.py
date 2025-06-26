from django.urls import path
from .views import (
    ItineraryView,
    ItineraryDetailView,
    AgentView,
    AgentMessageView,
)

urlpatterns = [
    path('itineraries/', ItineraryView.as_view(), name='itinerary'),
    path('itineraries/<int:pk>/', ItineraryDetailView.as_view(), name='itinerary-detail'),
    path('itineraries/<int:pk>/agents/<uuid:config_id>/', AgentView.as_view(), name='agent'),
    path('itineraries/<int:pk>/agents/<uuid:config_id>/message/', AgentMessageView.as_view(), name='agent-message'),
]