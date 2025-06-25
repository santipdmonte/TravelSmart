from django.urls import path
from . import views

# /api/itineraries/
urlpatterns = [
    path('itineraries/generate/', views.itinerary_generate, name='itinerary-generate'),
    path('itineraries/<int:pk>/', views.itinerary_detail, name='itinerary-detail'),
    path('itineraries/<int:pk>/modify/', views.itinerary_modify, name='itinerary-modify'),
    path('agent/initialize/', views.initialize_agent, name='agent-initialize'),
    path('agent/user_response/', views.user_response, name='agent-user-response'),
    path('agent/HIL_response/', views.HIL_response, name='agent-hil-response'),
    path('agent/get_state/', views.get_state, name='agent-get-state'),
]

# POST itineraries/
# GET itineraries/

# GET itineraries/<int:pk>/
# PUT itineraries/<int:pk>
# DELETE itineraries/<int:pk>

# POST agents/<int:pk>/
# GET agents/<int:pk>/
# POST agents/<int:pk>/message/