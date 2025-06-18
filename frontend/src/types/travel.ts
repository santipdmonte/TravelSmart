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

export type ItineraryAction =
  | { type: "SET_ITINERARY"; payload: ViajeState }
  | { type: "UPDATE_DETAILS"; payload: Partial<ViajeState> } // Partial permite actualizar solo algunas propiedades
  | { type: "CLEAR_ITINERARY" };

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
