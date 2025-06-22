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

export interface Activity {
  name: string;
  description: string;
  activity_order: number;
  details_activity: unknown; // El JSONField lo recibimos como un objeto genérico
}

export interface Day {
  day_number: number;
  date: string; // Formato "YYYY-MM-DD"
  activities: Activity[];
}

export interface ItineraryDestination {
  destination_name: string;
  country_name: string;
  days_in_destination: number;
  destination_order: number;
  days: Day[];
}

// Este es el objeto principal que manejará nuestro Context y estado
export interface Itinerary {
  id: number;
  trip_name: string;
  visibility: "private" | "unlisted" | "public";
  status: "draft" | "confirmed";
  created_at: string; // Formato ISO datetime
  updated_at: string; // Formato ISO datetime
  details_itinerary: unknown; // El JSONField completo
  destinations: ItineraryDestination[];
}

// Actualizamos las acciones del Reducer para que usen el nuevo tipo
export type ItineraryAction =
  | { type: "SET_ITINERARY"; payload: Itinerary }
  | { type: "CLEAR_ITINERARY" };
