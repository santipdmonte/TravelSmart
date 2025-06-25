import json
from json import tool
from typing import TypedDict, List, Dict, Any

# Definimos una clase para la herramienta para que sea más robusta
class ItineraryInput(TypedDict):
    new_itinerary: Dict[str, Any]
    new_itinerary_modifications_summary: str

# Esta es la herramienta que usa el Agente para aplicar cambios
@tool
def apply_itinerary_modifications(new_itinerary: str | Dict) -> Dict[str, Any]:
    """
    Toma el nuevo itinerario propuesto por el LLM, se asegura de que sea un
    diccionario de Python y lo establece como el nuevo estado de 'itinerary' del agente.
    """
    try:
        print("--- Herramienta 'apply_itinerary_modifications' INVOCADA ---")
        
        itinerary_dict = {}
        # CORRECCIÓN: Nos aseguramos de que el itinerario sea un diccionario
        if isinstance(new_itinerary, str):
            # Si es un string, lo convertimos desde JSON
            itinerary_dict = json.loads(new_itinerary)
        elif isinstance(new_itinerary, dict):
            # Si ya es un diccionario, lo usamos directamente
            itinerary_dict = new_itinerary
        else:
            raise TypeError("El argumento 'new_itinerary' no es ni un string JSON ni un diccionario.")
        
        print("--- Herramienta 'apply_itinerary_modifications' COMPLETADA CON ÉXITO ---")
        
        # Devolvemos el nuevo estado que se guardará en la "memoria" del agente
        return {"itinerary": itinerary_dict}
        
    except Exception as e:
        print(f"!!! ERROR dentro de la herramienta 'apply_itinerary_modifications': {e}")
        # Si algo sale mal, devolvemos un mensaje de error claro.
        return {"error": f"No se pudieron aplicar los cambios. Error: {e}"}
