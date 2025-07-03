import { Itinerary, ItineraryBase, GenerateItineraryRequest, ApiResponse } from '@/types/itinerary';
import { getAccessToken, ensureValidToken, refreshToken, clearTokens } from './authApi';

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

// Get authentication headers (JWT or session-based)
function getAuthHeaders(): Record<string, string> {
  const accessToken = getAccessToken();
  const sessionId = getSessionId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId, // Always include session ID for backward compatibility
  };
  
  // Add Authorization header if user is authenticated
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

// Base fetch wrapper with dual authentication support
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Ensure valid token if user is authenticated
    const hasValidToken = await ensureValidToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    // Handle 401 Unauthorized - try token refresh once
    if (response.status === 401 && hasValidToken) {
      const refreshResult = await refreshToken();
      
      if (refreshResult.data) {
        // Retry the original request with new token
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
          ...options,
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return { data };
        }
      } else {
        // Refresh failed, clear tokens
        clearTokens();
      }
    }

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
export async function getSessionItineraries(): Promise<ApiResponse<ItineraryBase[]>> {
  const sessionId = getSessionId();
  return apiRequest<ItineraryBase[]>(`/api/itineraries/session/${sessionId}`);
} 