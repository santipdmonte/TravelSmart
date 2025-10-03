export type TransportType =
  | "Avión"
  | "Tren"
  | "Colectivo"
  | "Auto"
  | "Barco"
  | "Otro";

export interface TransporteEntreDestinos {
  ciudad_origen: string;
  ciudad_destino: string;
  tipo_transporte: TransportType;
  justificacion: string;
  alternativas: string[];
}

export interface Destino {
  ciudad: string;
  pais: string;
  pais_codigo: string;
  coordenadas: string;
  // Added explicit numeric coordinates for mapping (derived from or replacing 'coordenadas').
  // Expected to be latitude and longitude in decimal degrees.
  latitude?: number;
  longitude?: number;
  dias_en_destino: number;
  // Optional helper copy for stays
  sugerencias_alojamiento?: string;
}

export interface ActivityItinerary {
  titulo: string; // Title or name of the activity
  descripcion: string; // Brief description
  horarios: string; // Schedule (range or open/close or recommendations)
  precio: string; // Price (approximate if applicable)
  requisitos_reserva: string; // Booking requirements (if applicable)
  enlace: string; // Link to booking or official page (if applicable)
  ubicacion: string; // Location (address / neighborhood / zone)
  transporte_recomendado: string; // Recommended transport from previous activity
}

export interface DailyItineraryItem {
  dia: string; // Day number (1, 2, 3, etc.)
  ciudad: string; // City for this day
  pais: string; // Country for this day
  titulo: string; // Title of the day
  actividades_mañana: ActivityItinerary[]; // Morning activities
  actividades_tarde: ActivityItinerary[]; // Afternoon activities
  actividades_noche: ActivityItinerary[]; // Evening activities
}

export interface ItineraryDetails {
  nombre_viaje: string;
  cantidad_dias: number;
  destino_general: string;
  resumen_viaje: string;
  justificacion_ruta_elegida: string;
  destinos: Destino[];
  transportes_entre_destinos?: TransporteEntreDestinos[] | null;
  // New structured daily itinerary fields (added after route confirmation)
  itinerario_diario?: DailyItineraryItem[];
  resumen_itinerario?: string;
  recomendaciones_generales?: string;
  actividades_extras?: string;
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
  // Additional optional answers, wrapped for backend compatibility
  preferences?: {
    when?: "winter" | "spring" | "summer" | "fall";
    goal?: string;
    trip_type?:
      | "business"
      | "couples"
      | "friends"
      | "boys"
      | "girls"
      | "solo"
      | "family_teen"
      | "family_young_kids";
    occasion?:
      | "anniversary"
      | "bachelorette"
      | "bachelor"
      | "birthday"
      | "graduation"
      | "honeymoon"
      | "spring_break"
      | "christmas"
      | "new_years";
    city_view?: "touristy" | "off_beaten" | "local";
    travel_styles?: string[];
    food_preferences?: string[];
    budget?: number | null; // USD per person, entire trip
    budget_currency?: "USD";
    notes?: string; // up to 250 chars
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
