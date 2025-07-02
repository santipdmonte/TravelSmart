import { AgentState, AgentResponse, ApiResponse, HILResponse } from '@/types/agent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

// Get session ID for headers
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Parse HIL response from agent response
export function parseHILResponse(response: AgentResponse): HILResponse {
  try {
    // Check if there are tool calls in the latest AI message
    const agentState = response[0];
    const lastMessage = agentState.messages[agentState.messages.length - 1];
    
    if (lastMessage?.type === 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      const toolCall = lastMessage.tool_calls.find(tc => tc.name === 'apply_itinerary_modifications');
      
      if (toolCall) {
        // Check for HIL confirmation message in the complex response structure
        const hilData = response[6]; // Array containing HIL information
        
        if (hilData && Array.isArray(hilData) && hilData.length > 0) {
          const hilEntry = hilData[0];
          // Type guard for hilEntry structure
          if (hilEntry && 
              typeof hilEntry === 'object' && 
              hilEntry !== null &&
              '4' in hilEntry &&
              Array.isArray((hilEntry as Record<string, unknown>)[4]) &&
              ((hilEntry as Record<string, unknown>)[4] as unknown[])[0] &&
              typeof ((hilEntry as Record<string, unknown>)[4] as unknown[])[0] === 'object' &&
              ((hilEntry as Record<string, unknown>)[4] as unknown[])[0] !== null &&
              'value' in (((hilEntry as Record<string, unknown>)[4] as unknown[])[0] as Record<string, unknown>)) {
            
            const value = (((hilEntry as Record<string, unknown>)[4] as unknown[])[0] as Record<string, unknown>).value;
            
            return {
              isHIL: true,
              confirmationMessage: typeof value === 'string' ? value : 'Confirm changes?',
              proposedChanges: toolCall.args.new_itinerary,
              summary: toolCall.args.new_itinerary_modifications_summary
            };
          }
        }
        
        // Fallback: if we have tool calls but no HIL structure, still might be HIL
        return {
          isHIL: true,
          confirmationMessage: `¿Confirmas estos cambios? ${toolCall.args.new_itinerary_modifications_summary || ''}`,
          proposedChanges: toolCall.args.new_itinerary,
          summary: toolCall.args.new_itinerary_modifications_summary
        };
      }
    }
    
    return { isHIL: false };
  } catch (error) {
    console.error('Error parsing HIL response:', error);
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
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
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
    console.error('Agent API request failed:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Initialize agent for itinerary (using itinerary_id as thread_id)
export async function initializeAgent(
  itineraryId: string
): Promise<ApiResponse<AgentState>> {
  const response = await agentApiRequest<AgentResponse>(`/api/itineraries/${itineraryId}/agent/${itineraryId}`, {
    method: 'POST',
  });

  if (response.error) {
    return { error: response.error };
  }

  // Extract the AgentState from the response array structure
  if (response.data) {
    const agentState = response.data[0]; // First element is the AgentState
    return { data: agentState };
  }

  return { error: 'Invalid response format' };
}

// Send message to agent
export async function sendAgentMessage(
  itineraryId: string,
  message: string
): Promise<ApiResponse<{ agentState: AgentState; hilResponse: HILResponse }>> {
  // Encode the message as a query parameter
  const encodedMessage = encodeURIComponent(message);
  const response = await agentApiRequest<AgentResponse>(`/api/itineraries/${itineraryId}/agent/${itineraryId}/messages?message=${encodedMessage}`, {
    method: 'POST',
  });

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
        hilResponse 
      } 
    };
  }

  return { error: 'Invalid response format' };
}

// Get current agent state (using itinerary_id as thread_id)
export async function getAgentState(
  itineraryId: string
): Promise<ApiResponse<AgentState>> {
  const response = await agentApiRequest<AgentResponse>(`/api/itineraries/agent/${itineraryId}`);

  if (response.error) {
    return { error: response.error };
  }

  // Extract the AgentState from the response array structure
  if (response.data) {
    const agentState = response.data[0]; // First element is the AgentState
    return { data: agentState };
  }

  return { error: 'Invalid response format' };
} 