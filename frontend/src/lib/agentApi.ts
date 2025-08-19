import {
  AgentState,
  AgentResponse,
  ApiResponse,
  HILResponse,
  ToolCall,
} from "@/types/agent";
import { API_BASE_URL } from "./config";

// Get session ID for headers
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

// Parse HIL response from agent response
export function parseHILResponse(response: AgentResponse): HILResponse {
  try {
    const agentState = response[0];
    const messages = agentState.messages || [];
    const lastMessage = messages[messages.length - 1];

    // Helper: try to extract the apply tool call from recent messages
    const recent = messages.slice(-3);
    let toolCall: ToolCall | undefined;
    for (const msg of recent) {
      if (msg?.tool_calls && msg.tool_calls.length > 0) {
        const found = msg.tool_calls.find(
          (tc) => tc.name === "apply_itinerary_modifications"
        );
        if (found) {
          toolCall = found;
          break;
        }
      }
    }

    // Heuristic flags indicating an interrupt/HIL
    const hasApplyTool = Boolean(toolCall);
    const hilDataUnknown: unknown = (response as unknown as { 6?: unknown })[6];
    const hilDataArray = Array.isArray(hilDataUnknown)
      ? (hilDataUnknown as unknown[])
      : undefined;
    const hasHilDataArray = Array.isArray(hilDataArray);

    const hasIsHIL = (obj: unknown): obj is { isHIL: boolean } => {
      return (
        typeof obj === "object" &&
        obj !== null &&
        "isHIL" in (obj as Record<string, unknown>) &&
        typeof (obj as { isHIL?: unknown }).isHIL === "boolean"
      );
    };

    const lastHasHilFlag = Boolean(
      (hasIsHIL(lastMessage?.additional_kwargs) &&
        lastMessage?.additional_kwargs.isHIL) ||
        (hasIsHIL(lastMessage?.response_metadata) &&
          lastMessage?.response_metadata.isHIL)
    );

    const isHIL = hasApplyTool || lastHasHilFlag || hasHilDataArray;
    if (!isHIL) {
      return { isHIL: false };
    }

    // Try to extract a human-friendly confirmation message
    let confirmationMessage: string | undefined;
    if (Array.isArray(hilDataArray) && hilDataArray.length > 0) {
      const first = hilDataArray[0] as unknown;
      if (first && typeof first === "object") {
        const rec = first as Record<string, unknown>;
        const maybe4 = rec["4"];
        if (Array.isArray(maybe4) && maybe4.length > 0) {
          const entry0 = maybe4[0] as unknown;
          if (
            entry0 &&
            typeof entry0 === "object" &&
            "value" in (entry0 as Record<string, unknown>)
          ) {
            const val = (entry0 as { value: unknown }).value;
            if (typeof val === "string" && val.trim()) {
              confirmationMessage = val;
            }
          }
        }
      }
    }
    if (!confirmationMessage) {
      // Fallback to AI text if present
      if (
        typeof lastMessage?.content === "string" &&
        lastMessage.content.trim()
      ) {
        confirmationMessage = lastMessage.content;
      } else {
        confirmationMessage = "¿Confirmas estos cambios?";
      }
    }

    return {
      isHIL: true,
      confirmationMessage,
      proposedChanges: toolCall?.args?.new_itinerary,
      summary: toolCall?.args?.new_itinerary_modifications_summary,
    };
  } catch (error) {
    console.error("Error parsing HIL response:", error);
    return { isHIL: false };
  }
}

// Base fetch wrapper with session ID header
async function agentApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const sessionId = getSessionId();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Agent API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Initialize agent for itinerary (using itinerary_id as thread_id)
export async function initializeAgent(
  itineraryId: string
): Promise<ApiResponse<AgentState>> {
  const response = await agentApiRequest<AgentResponse>(
    `/itineraries/${itineraryId}/agent/${itineraryId}`,
    {
      method: "POST",
    }
  );

  if (response.error) {
    return { error: response.error };
  }

  // Extract the AgentState from the response array structure
  if (response.data) {
    const agentState = response.data[0]; // First element is the AgentState
    return { data: agentState };
  }

  return { error: "Invalid response format" };
}

// Send message to agent
export async function sendAgentMessage(
  itineraryId: string,
  message: string
): Promise<ApiResponse<{ agentState: AgentState; hilResponse: HILResponse }>> {
  // Encode the message as a query parameter
  const encodedMessage = encodeURIComponent(message);
  const response = await agentApiRequest<AgentResponse>(
    `/itineraries/${itineraryId}/agent/${itineraryId}/messages?message=${encodedMessage}`,
    {
      method: "POST",
    }
  );

  if (response.error) {
    return { error: response.error };
  }

  // Extract the AgentState and HIL information from the response array structure
  if (response.data) {
    const agentState = response.data[0]; // First element is the AgentState
    const hilResponse = parseHILResponse(response.data);

    return {
      data: {
        agentState,
        hilResponse,
      },
    };
  }

  return { error: "Invalid response format" };
}

// Get current agent state (using itinerary_id as thread_id)
export async function getAgentState(
  itineraryId: string
): Promise<ApiResponse<AgentState>> {
  const response = await agentApiRequest<AgentResponse>(
    `/itineraries/agent/${itineraryId}`
  );

  if (response.error) {
    return { error: response.error };
  }

  // Extract the AgentState from the response array structure
  if (response.data) {
    const agentState = response.data[0]; // First element is the AgentState
    return { data: agentState };
  }

  return { error: "Invalid response format" };
}
