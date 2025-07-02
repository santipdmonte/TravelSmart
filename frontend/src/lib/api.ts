import { Itinerary, GenerateItineraryRequest, ApiResponse } from '@/types/itinerary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

// Generate a session ID if not exists
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Base fetch wrapper with session ID header
async function apiRequest<T>(
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
    console.error('API request failed:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Generate new itinerary
export async function generateItinerary(
  request: GenerateItineraryRequest
): Promise<ApiResponse<Itinerary>> {
  return apiRequest<Itinerary>('/api/itineraries/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Get itinerary by ID
export async function getItinerary(
  itineraryId: string
): Promise<ApiResponse<Itinerary>> {
  return apiRequest<Itinerary>(`/api/itineraries/${itineraryId}`);
}

// Get all itineraries for current session
export async function getSessionItineraries(): Promise<ApiResponse<Itinerary[]>> {
  const sessionId = getSessionId();
  return apiRequest<Itinerary[]>(`/api/itineraries/session/${sessionId}`);
} 