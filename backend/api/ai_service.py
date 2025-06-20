# backend/itineraries/ai_service.py

import requests
from django.conf import settings

# Es una buena práctica tener la URL de la API de IA en tu settings
# y leerla desde las variables de entorno (.env)
AI_API_BASE_URL = settings.AI_API_URL 

def generate_itinerary_from_ai(trip_name: str, days: int, other_preferences: dict = None):
    """
    Llama al servicio externo de IA para generar un itinerario completo.

    Args:
        trip_name (str): El nombre o destino principal del viaje.
        days (int): La cantidad de días del viaje.
        other_preferences (dict): Un diccionario con otras preferencias (presupuesto, etc.).

    Returns:
        dict: El JSON con el itinerario detallado, o None si hubo un error.
    """
    # 1. Define el endpoint específico de tu API de IA
    endpoint_url = f"{AI_API_BASE_URL}/itinerario" # <- NECESITAREMOS VERIFICAR ESTA RUTA

    # 2. Prepara los datos que le enviarás a la IA en formato JSON
    payload = {
        "nombre_viaje": trip_name,
        "cantidad_dias": days,
        # ... aquí irían otros campos que tu IA necesite
    }
    if other_preferences:
        payload.update(other_preferences)

    print(f"Enviando petición a la API de IA: {endpoint_url} con los datos: {payload}")

    try:
        # 3. Realiza la petición POST
        response = requests.post(endpoint_url, json=payload, timeout=120) # Timeout de 2 minutos

        # 4. Verifica si la petición fue exitosa (código 2xx)
        response.raise_for_status()

        # 5. Devuelve el JSON de la respuesta
        return response.json()

    except requests.exceptions.RequestException as e:
        # Maneja errores de conexión, timeout, etc.
        print(f"Error al conectar con la API de IA: {e}")
        return None
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")
        return None