from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def private_endpoint(request):
    # El decorador 'api_view' junto con la configuración en settings.py
    # asegura que esta vista solo sea accesible con un token válido.
    # El payload del token está en request.auth
    auth0_user_id = request.auth.get('sub') 
    message = f"Hola usuario {auth0_user_id}! Este es un mensaje privado desde el backend de Django."
    return Response({'message': message})