export interface AccommodationCreateRequest {
  itinerary_id: string;
  city: string;
  url: string;
}

export interface AccommodationResponse {
  id: string;
  itinerary_id: string;
  city: string;
  url: string;
  title?: string | null;
  description?: string | null;
  img_urls: string[];
  provider?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AccommodationListResponse = AccommodationResponse[];


