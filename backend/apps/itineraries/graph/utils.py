import json
from pydantic.json import pydantic_encoder

def extract_chatbot_message(state_info):
    """Helper function to extract chatbot message from state info"""
    chatbot_message = ""
    if 'messages' in state_info and len(state_info['messages']) > 0:
        # Get the last AI message content
        for message in reversed(state_info['messages']):
            try:
                # Handle message objects (like AIMessage)
                if hasattr(message, 'type') and message.type == 'ai':
                    chatbot_message = getattr(message, 'content', '')
                    break
                # Handle dictionary format
                elif isinstance(message, dict) and message.get('type') == 'ai':
                    chatbot_message = message.get('content', '')
                    break
            except Exception as e:
                print(f"Error extracting message: {e}")
                continue
    return chatbot_message

def detect_hil_mode(raw_state):
    """
    Valida si el estado del agente indica que está esperando una respuesta
    de tipo Humano-en-el-Bucle (HIL).

    La principal señal es la presencia de una estructura específica en el último
    elemento de la lista de estado, que representa la salida pendiente. Esta
    estructura es una lista que contiene un diccionario con la clave "resumable"
    y su valor establecido en True.

    Args:
        state (list): El objeto de estado del agente, que es una lista de
                      componentes que representan la conversación y el flujo
                      de ejecución.

    Returns:
        bool: True si el estado indica que se espera una respuesta HIL,
              False en caso contrario.
    """
    state = raw_state[0]

    # 1. Validación básica: Asegurarse de que el estado es una lista y no está vacía.
    if not isinstance(state, list) or not state:
        return False

    # 2. El indicador HIL se encuentra en el último elemento de la lista de estado.
    last_element = state[-1]

    # 3. Comprobar si el último elemento sigue la estructura esperada para un prompt HIL:
    #    Debe ser una lista que contenga al menos un diccionario.
    if not isinstance(last_element, list) or not last_element:
        return False

    # 4. Los datos reales del prompt HIL suelen ser el primer diccionario en esta lista.
    hil_prompt_data = last_element[0]

    # 5. La comprobación definitiva: este objeto debe ser un diccionario
    #    y contener la clave "resumable" con el valor True.
    if isinstance(hil_prompt_data, dict) and hil_prompt_data.get("resumable") is True:
        return True

    return False

def state_to_json(state):
    """Convert the state to a JSON string"""
    return json.dumps(state, default=pydantic_encoder)

def state_to_dict(state):
    """Convert the state to a dictionary"""
    return json.loads(state_to_json(state))


def process_state(state):
    """Process the state to a JSON string"""
    state_json = state_to_json(state)
    state_dict = state_to_dict(state)
    return state_json, state_dict