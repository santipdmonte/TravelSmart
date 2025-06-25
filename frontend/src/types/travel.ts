/*
export interface TransporteState {
  origen: string;
  destino: string;
  tipo: string; // Avion, Tren, Bus, Auto, Barco, etc.
}

export interface ActividadState {
  id: string;
  nombre: string;
  descripcion: string;
  transporte: TransporteState | null;
}

export interface DiaViajeState {
  posicion_dia: number;
  actividades: ActividadState[];
}

export interface ViajeStateInput {
  destino: string;
  cantidad_dias: number;
}

export interface ViajeState {
  destino: string;
  cantidad_dias: number;
  dias_viaje: DiaViajeState[];
  fecha_salida?: string;
  cantidad_personas?: number;
  cantidad_ninos?: number;
}

export interface AccommodationState {
  ciudad: string;
  desde_dia: number;
  hasta_dia: number;
  noches: number;
}

export interface TransportationState {
  dia: number;
  origen: string;
  destino: string;
  tipo: string;
  descripcion: string;
}
*/
export interface Activity {
  name: string;
  description: string;
  activity_order: number;
  details_activity: unknown;
}

export interface Day {
  day_number: number;
  date: string | null; // La fecha puede ser nula
  activities: Activity[];
}

export interface ItineraryDestination {
  destination_name: string;
  country_name: string;
  days_in_destination: number;
  destination_order: number;
  days: Day[];
}

export interface Itinerary {
  id: number;
  trip_name: string;
  visibility: "private" | "unlisted" | "public";
  status: "draft" | "confirmed";
  created_at: string;
  updated_at: string;
  details_itinerary: unknown;
  destinations: ItineraryDestination[];
  // Añadimos los campos que el usuario puede completar
  start_date?: string;
  num_adults?: number;
}

// Acción para nuestro Context, ahora usando el tipo correcto
export type ItineraryAction =
  | { type: "SET_ITINERARY"; payload: Itinerary }
  | { type: "CLEAR_ITINERARY" };
