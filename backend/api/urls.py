from django.urls import path
from . import views

urlpatterns = [
    path('private/', views.private_endpoint, name='private_endpoint'),
]