from langgraph.graph import START, END, StateGraph
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from .prompts import get_itinerary_prompt
from dotenv import load_dotenv

load_dotenv()

from .state import (
    ViajeState,
    ViajeStateInput
)

def graph_generate_itinerary(state: ViajeStateInput): # -> ViajeState:
    """Generar el plan de viaje
    
    Args:
        state: Input state
    """

    print(f"Initail State: {state}")

    # Generar el plan de viaje
    model = ChatOpenAI(model="gpt-4o-mini")

    structured_llm = model.with_structured_output(ViajeState)
    results = structured_llm.invoke(
    # results = model.invoke(
        [
            SystemMessage(content=get_itinerary_prompt(state))#,
        ]
    )

    print(f"State: {results}")

    return results 


# Add nodes
builder = StateGraph(ViajeState, input=ViajeStateInput, output=ViajeState)
builder.add_node("generate_itinerary", graph_generate_itinerary)

# Add edges
builder.add_edge(START, "generate_itinerary")
builder.add_edge("generate_itinerary", END)

itinerary_graph = builder.compile()
