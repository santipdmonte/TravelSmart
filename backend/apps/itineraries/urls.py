from django.urls import path
from .views import (
    ItineraryCreateView,
    ItineraryDetailView,
    AgentInitializeView,
    AgentView,
)

urlpatterns = [
    path('itineraries/', ItineraryCreateView.as_view(), name='itinerary'),
    path('itineraries/<int:pk>/', ItineraryDetailView.as_view(), name='itinerary-detail'),
    path('itineraries/<int:pk>/agents/<int:thread_id>/', AgentInitializeView.as_view(), name='agent'),
    path('agents/<int:thread_id>/', AgentView.as_view(), name='agent-message'),
]