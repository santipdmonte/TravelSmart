import { AgentState, AgentResponse, SendMessageRequest, ApiResponse } from '@/types/agent';

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
): Promise<ApiResponse<AgentState>> {
  // Encode the message as a query parameter
  const encodedMessage = encodeURIComponent(message);
  const response = await agentApiRequest<AgentResponse>(`/api/itineraries/${itineraryId}/agent/${itineraryId}/messages?message=${encodedMessage}`, {
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