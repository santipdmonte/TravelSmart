from django.shortcuts import render

# --- Endpoint de prueba de Autenticación ---

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Aseguramos que solo usuarios autenticados entren
def private_endpoint(request):
    """
    Endpoint privado para verificar que la autenticación con Auth0 funciona.
    """
    # El payload del token está en request.auth gracias a nuestra clase de autenticación
    auth0_user_id = request.auth.get('sub') 
    message = f"Hola usuario {auth0_user_id}! Este es un mensaje privado desde el backend de Django."
    return Response({'message': message})
