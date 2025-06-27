import json
from pydantic.json import pydantic_encoder
from sqlalchemy import null
from .graph.itinerary_graph import itinerary_graph
from .graph.itinerary_agent import itinerary_agent
from langgraph.types import Command
from .graph.state import ViajeStateInput, ViajeState
from .graph.utils import extract_chatbot_message, detect_hil_mode
from langchain_core.runnables import RunnableConfig
from .models import Itinerary, Destination, ItineraryDestination, Day, Activity


def generate_itinerary_service(input_state: ViajeStateInput):
    try:
        result = itinerary_graph.invoke(input_state)
        return result

    except Exception as e:
        print(f"Error generating itinerary: {e}")
        raise e


def initialize_agent_service(thread_id: str, itinerary_state: ViajeState):

    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id,
        }
    }

    initial_state = {
        "itinerary": itinerary_state,
        "user_name": "Juan",
        "user_id": "user_123",
    }

    itinerary_agent.invoke(initial_state, config=config)

    raw_state = itinerary_agent.get_state(config)
    
    is_hil_mode, hil_message, state_values = detect_hil_mode(raw_state)
    
    if is_hil_mode:
        # HIL mode detected - extract state from values
        state_info = state_values if state_values else {}
        return {
            "mode": "hil",
            "hil_message": hil_message,
            "state": {
                "itinerary": state_info.get("itinerary", ""),
                "user_name": state_info.get("user_name", ""),
                "user_id": state_info.get("user_id", ""),
                "llm_input_messages": state_info.get("llm_input_messages", [])
            },
            "raw_state": raw_state  # Keep for debugging if needed
        }
    else:
        # Normal mode - extract the required information from the complex response structure
        # The raw_state is an array where the first element contains the state info
        state_info = raw_state[0] if len(raw_state) > 0 else {}
        
        # Extract the chatbot message content from the messages
        chatbot_message = extract_chatbot_message(state_info)
        
        # Return the structured response
        return {
            "mode": "normal",
            "state": {
                "itinerary": state_info.get("itinerary", ""),
                "user_name": state_info.get("user_name", ""),
                "user_id": state_info.get("user_id", ""),
                "llm_input_messages": state_info.get("llm_input_messages", [])
            },
            "chatbot_response": chatbot_message,
            "raw_state": raw_state  # Keep for debugging if needed
        }


def user_response_service(thread_id: str, user_response: str):
    """
    Procesa la respuesta del usuario, interpreta el estado del agente 
    y devuelve un diccionario simple y serializable.
    """
    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    itinerary_agent.invoke({"messages": user_response}, config=config)

    raw_state = itinerary_agent.get_state(config)
    
    is_hil_mode, hil_message, state_values = detect_hil_mode(raw_state)
    
    if is_hil_mode:
        print(f"Modo HIL detectado. Mensaje: {hil_message}")
        
        # --- CORRECCIÓN ---
        # Comprobamos si state_values tiene un valor antes de intentar usarlo.
        itinerary_preview = None
        if state_values:
            itinerary_preview = state_values.get("itinerary")
        
        return {
            "mode": "hil",
            "chatbot_response": hil_message,
            "itinerary_preview": itinerary_preview
        }
    else:
        # El agente simplemente respondió con un mensaje de chat normal.
        state_info = raw_state.values if raw_state else {}
        chatbot_message = extract_chatbot_message(state_info)
        print(f"Modo Normal detectado. Mensaje: {chatbot_message}")
        return {
            "mode": "normal",
            "chatbot_response": chatbot_message,
            "itinerary_preview": state_info.get("itinerary")
        }

def user_HIL_response_service(thread_id: str, user_HIL_response: str):
    """
    Procesa la respuesta HIL, reanuda el agente y extrae el itinerario modificado
    de la llamada a la herramienta para la vista previa.
    """
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}}
    
    # Reanudamos el agente. Con la herramienta corregida, ya no debería fallar.
    itinerary_agent.invoke(Command(resume=user_HIL_response), config=config)
    
    final_state = itinerary_agent.get_state(config)
    
    itinerary_preview = None
    if final_state and final_state.values:
        # LÓGICA DE EXTRACCIÓN MEJORADA: Buscamos hacia atrás
        messages = final_state.values.get('messages', [])
        # Recorremos los mensajes desde el más reciente al más antiguo
        for message in reversed(messages):
            if message.tool_calls:
                # Encontramos el último AIMessage que llamó a una herramienta
                tool_args = message.tool_calls[0].get('args', {})
                itinerary_data = tool_args.get('new_itinerary')
                
                if isinstance(itinerary_data, str):
                    itinerary_preview = json.loads(itinerary_data)
                elif isinstance(itinerary_data, dict):
                    itinerary_preview = itinerary_data
                
                # Una vez que lo encontramos, rompemos el bucle
                if itinerary_preview:
                    break
    
    # Si por alguna razón no lo encontramos, usamos el estado principal como fallback.
    if not itinerary_preview and final_state and final_state.values:
        itinerary_preview = final_state.values.get("itinerary")

    return {
        "mode": "normal",
        "chatbot_response": "¡Perfecto! He aplicado los cambios a tu borrador de itinerario. ¿Quieres hacer algún otro cambio?",
        "itinerary_preview": itinerary_preview
    }

def get_state_service(thread_id: str):

    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    state = itinerary_agent.get_state(config)
    state_dict = state_to_dict(state)

    return state_dict

def save_itinerary_changes(itinerary_id: str, changes: dict):
    """
    Save the changes to the itinerary.
    """
    pass

def create_itinerary_from_ia(trip_name: str, days: int, session_id: str):
    """
    Función de servicio completa:
    1. Llama a la IA para generar un itinerario.
    2. Parsea la respuesta.
    3. Guarda todo en la base de datos.
    4. Devuelve el objeto Itinerary creado.
    """
    try:
        input_state = ViajeStateInput(nombre_viaje=trip_name, cantidad_dias=days)
    except Exception as e:
        print(f"Error creando el Pydantic input: {e}")
        raise ValueError("Invalid input data for AI service.")

    # 1. Llamar a la IA
    ai_response_object = itinerary_graph.invoke(input_state)
    if not ai_response_object:
        raise Exception("AI service did not return a response.")

    # Convertimos a un diccionario limpio
    json_string = json.dumps(ai_response_object, default=pydantic_encoder)
    ai_response_dict = json.loads(json_string)

    # 2. Guardar el itinerario principal
    itinerary = Itinerary.objects.create(
        trip_name=trip_name,
        session_id=session_id,
        details_itinerary=ai_response_dict
    )

    # 3. Parsear y guardar los detalles relacionales
    for dest_order, dest_data in enumerate(ai_response_dict.get('destinos', [])):
        if not dest_data.get('dias_destino'):
            continue

        raw_destination_name = dest_data.get('nombre_destino', 'Destino Desconocido')
        city_parts = raw_destination_name.split(',')
        city = city_parts[0].strip()
        country = city_parts[1].strip() if len(city_parts) > 1 else itinerary.trip_name

        destination, _ = Destination.objects.get_or_create(
            city_name=city, country_name=country
        )
        
        it_dest = ItineraryDestination.objects.create(
            itinerary=itinerary, 
            destination=destination,
            days_in_destination=dest_data.get('cantidad_dias_en_destino', 0),
            destination_order=dest_order + 1
        )
        
        for day_data in dest_data.get('dias_destino', []):
            day = Day.objects.create(
                itinerary_destination=it_dest,
                day_number=day_data.get('posicion_dia'),
                date=None
            )
            
            activities_data = day_data.get('actividades', [])
            activity_list = []
            if isinstance(activities_data, str):
                activity_list = [act.strip() for act in activities_data.split('.') if act.strip()]
            elif isinstance(activities_data, list):
                activity_list = activities_data
            
            for act_order, act_data in enumerate(activity_list):
                activity_name = ""
                if isinstance(act_data, dict):
                    activity_name = act_data.get('nombre', '')
                elif isinstance(act_data, str):
                    activity_name = act_data
                
                if activity_name:
                    Activity.objects.create(
                        day=day, 
                        name=activity_name,
                        description='',
                        activity_order=act_order + 1
                    )
    
    itinerary.refresh_from_db()

    return itinerary