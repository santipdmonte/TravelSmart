import { apiRequest } from "@/lib/api";
import {
  AccommodationCreateRequest,
  AccommodationListResponse,
  AccommodationResponse,
} from "@/types/accommodation";

export async function listAccommodationsByItineraryAndCity(
  itineraryId: string,
  city: string,
  params?: { skip?: number; limit?: number }
) {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString();
  const path = `/api/accommodations/by-itinerary/${itineraryId}/city/${encodeURIComponent(
    city
  )}${qs ? `?${qs}` : ""}`;
  return apiRequest<AccommodationListResponse>(path);
}

export async function createAccommodation(
  payload: AccommodationCreateRequest
) {
  return apiRequest<AccommodationResponse>(`/api/accommodations/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function softDeleteAccommodation(accommodationId: string) {
  // Align with backend route name if different; using soft-delete path provided
  return apiRequest<AccommodationResponse>(
    `/api/accommodations/${accommodationId}`,
    { method: "DELETE" }
  );
}


