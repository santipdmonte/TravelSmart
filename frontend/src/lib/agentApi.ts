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

// initializeAgent deprecated – backend initializes on first message

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

// Stream message to agent (SSE-like via fetch body stream)
export async function sendAgentMessageStream(
  itineraryId: string,
  threadId: string,
  message: string,
  onToken: (token: string) => void
): Promise<ApiResponse<true>> {
  const sessionId = getSessionId();
  const encodedMessage = encodeURIComponent(message);
  const url = `${API_BASE_URL}/api/itineraries/${itineraryId}/agent/${threadId}/messages/stream?message=${encodedMessage}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'X-Session-ID': sessionId,
      },
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Read and parse SSE chunks: events are separated by double newlines. Each event line starts with 'data: '
    // Backend yields JSON tokens as: data: {"token": "..."}\n\n and completion as: data: [DONE]\n\n
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let eventEndIndex;
      // Process complete events in the buffer
      while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);

        const lines = rawEvent.split('\n');
        for (const line of lines) {
          const prefix = 'data: ';
          if (!line.startsWith(prefix)) continue;
          const dataStr = line.slice(prefix.length).trim();
          if (dataStr === '[DONE]') {
            // Completed
            return { data: true };
          }
          try {
            const parsed = JSON.parse(dataStr) as { token?: string };
            if (parsed.token) {
              onToken(parsed.token);
            }
          } catch (e) {
            console.error('Failed to parse stream chunk:', e, dataStr);
          }
        }
      }
    }

    // If stream ended without explicit [DONE], still consider successful
    return { data: true };
  } catch (error) {
    console.error('Agent stream request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
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

// Get current agent state including HIL parsing
export async function getAgentStateWithHIL(
  itineraryId: string
): Promise<ApiResponse<{ agentState: AgentState; hilResponse: HILResponse }>> {
  const response = await agentApiRequest<AgentResponse>(`/api/itineraries/agent/${itineraryId}`);

  if (response.error) {
    return { error: response.error };
  }

  if (response.data) {
    const agentState = response.data[0];
    const hilResponse = parseHILResponse(response.data);
    return { data: { agentState, hilResponse } };
  }

  return { error: 'Invalid response format' };
}