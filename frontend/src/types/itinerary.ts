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
  visibility: 'private' | 'public';
  status: 'draft' | 'published';
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
  // Additional optional answers, wrapped for backend compatibility
  preferences?: {
    when?: 'winter' | 'spring' | 'summer' | 'fall';
    trip_type?: 'business' | 'couples' | 'friends' | 'boys' | 'girls' | 'solo' | 'family_teen' | 'family_young_kids';
    occasion?: 'anniversary' | 'bachelorette' | 'bachelor' | 'birthday' | 'graduation' | 'honeymoon' | 'spring_break' | 'christmas' | 'new_years';
    city_view?: 'touristy' | 'off_beaten' | 'local';
    travel_styles?: string[];
    food_preferences?: string[];
    budget?: number | null; // USD per person, entire trip
    budget_currency?: 'USD';
    notes?: string; // up to 250 chars
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 