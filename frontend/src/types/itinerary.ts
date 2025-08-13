export interface DayActivity {
  posicion_dia: number;
  actividades: string;
}

export interface Destination {
  nombre_destino: string;
  cantidad_dias_en_destino: number;
  dias_destino: DayActivity[];
}

export interface ItineraryDetails {
  nombre_viaje: string;
  cantidad_dias: number;
  destino_general: string;
  destinos: Destination[];
}

// Base itinerary interface (for list views)
export interface ItineraryBase {
  itinerary_id: string;
  user_id: string | null;
  session_id: string;
  slug: string | null;
  destination: string | null;
  start_date: string | null;
  duration_days: number;
  trip_name: string;
  trip_type: string | null;
  visibility: "private" | "public";
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

// Full itinerary interface (for detailed views)
export interface Itinerary extends ItineraryBase {
  travelers_count: number | null;
  budget: number | null;
  tags: string[] | null;
  notes: string | null;
  details_itinerary: ItineraryDetails;
  deleted_at: string | null;
}

export interface GenerateItineraryRequest {
  trip_name: string;
  duration_days: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// --- AI Itinerary Change Preview types ---
export type ActivityStatus = "unchanged" | "added" | "modified" | "deleted";

export interface DiffActivity {
  id: string;
  name: string;
  status: ActivityStatus;
}

export interface DiffDay {
  day_number: number;
  activities: DiffActivity[];
}

export interface ItineraryDiffResponse {
  days: DiffDay[];
  summary: string;
  proposed_itinerary: ItineraryDetails; // Backend returns full itinerary details payload
}
