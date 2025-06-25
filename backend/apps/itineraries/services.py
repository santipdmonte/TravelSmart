import json
from sqlalchemy import null
from .graph.itinerary_graph import itinerary_graph
from .graph.itinerary_agent import itinerary_agent
from langgraph.types import Command
from .graph.state import ViajeStateInput, ViajeState
from .graph.utils import extract_chatbot_message, detect_hil_mode
from langchain_core.runnables import RunnableConfig


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
    Procesa la respuesta HIL, reanuda el agente y devuelve el nuevo estado del itinerario,
    SIN GUARDAR en la base de datos.
    """
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}}
    
    # Reanudamos el agente con la confirmación del usuario.
    # El agente ahora ejecutará la herramienta, pero solo actualizará su estado interno.
    itinerary_agent.invoke(Command(resume=user_HIL_response), config=config)
    
    # Obtenemos el estado final del agente, que ahora contiene el itinerario modificado.
    final_state = itinerary_agent.get_state(config)

    # --- INICIO DEBUG ---
    # print("--- ESTADO FINAL DEL AGENTE (después de HIL) ---")
    # print(final_state)
    # print("-----------------------------------------------")
    # --- FIN DEBUG ---
    
    itinerary_preview = None
    if final_state and final_state.values:
        # --- LÓGICA DE EXTRACCIÓN MEJORADA ---
        # El itinerario modificado está en los argumentos de la última llamada a la herramienta.
        last_message = final_state.values.get('messages', [])[-1]
        if last_message.tool_calls:
            # Extraemos los argumentos de la primera llamada a herramienta
            tool_args_str = last_message.tool_calls[0].get('args', {}).get('new_itinerary')
            if tool_args_str:
                itinerary_preview = json.loads(tool_args_str) if isinstance(tool_args_str, str) else tool_args_str
    
    # Si no encontramos una vista previa en la llamada a la herramienta, usamos el estado principal como fallback.
    if not itinerary_preview and final_state and final_state.values:
        itinerary_preview = final_state.values.get("itinerary")

    return {
        "mode": "normal",
        "chatbot_response": "¡Perfecto! He actualizado el borrador de tu itinerario. ¿Quieres hacer algún otro cambio?",
        "itinerary_preview": itinerary_preview # Devolvemos el borrador actualizado
    }

def get_state_service(thread_id: str):

    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    return itinerary_agent.get_state(config)    

def save_itinerary_changes(itinerary_id: str, changes: dict):
    """
    Save the changes to the itinerary.
    """
    pass
