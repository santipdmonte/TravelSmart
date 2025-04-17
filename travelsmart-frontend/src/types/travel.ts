export interface TransporteState {
  origen: string;
  destino: string;
  tipo: string; // Avion, Tren, Bus, Auto, Barco, etc.
}

export interface ActividadState {
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
} 