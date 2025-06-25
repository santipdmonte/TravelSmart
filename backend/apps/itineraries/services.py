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

def call_ai_to_modify_itinerary(current_itinerary_json: dict, prompt: str):
    """
    Simula una llamada a la IA para modificar un itinerario existente.
    En el futuro, esto podría invocar a tu 'itinerary_agent'.
    """
    print("--- SIMULANDO MODIFICACIÓN DE IA ---")
    print(f"Itinerario actual: {current_itinerary_json.get('trip_name')}")
    print(f"Prompt del usuario: {prompt}")

    # Para esta simulación, simplemente devolvemos el mismo itinerario
    # pero con un pequeño cambio para que podamos ver la actualización.
    modified_itinerary = current_itinerary_json.copy()
    
    # Hacemos un cambio visible para la prueba
    if modified_itinerary.get('destinos'):
        modified_itinerary['destinos'][0]['nombre_destino'] = "Destino Modificado por IA"

    return modified_itinerary

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

    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    response = itinerary_agent.invoke({"messages": user_response}, config=config)

    # Get the raw state from the agent
    raw_state = itinerary_agent.get_state(config)

    print("--------------------------------")
    print(raw_state)
    print("--------------------------------")
    
    # Check if agent is in HIL mode
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

def user_HIL_response_service(thread_id: str, user_HIL_response: str):

    config: RunnableConfig = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    response = itinerary_agent.invoke(Command(resume={"messages": user_HIL_response}), config=config)

    # Get the raw state from the agent
    raw_state = itinerary_agent.get_state(config)
    
    print("--------------------------------")
    print("HIL Response:")
    print(raw_state)
    print("--------------------------------")
    
    # Check if agent is in HIL mode again (could be chained HIL requests)
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
