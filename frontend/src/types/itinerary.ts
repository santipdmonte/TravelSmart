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

export interface Itinerary {
  user_id: string | null;
  session_id: string;
  slug: string | null;
  destination: string | null;
  start_date: string | null;
  duration_days: number;
  travelers_count: number | null;
  budget: number | null;
  trip_type: string | null;
  tags: string[] | null;
  notes: string | null;
  details_itinerary: ItineraryDetails;
  trip_name: string;
  visibility: 'private' | 'public';
  status: 'draft' | 'published';
  itinerary_id: string;
  created_at: string;
  updated_at: string;
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