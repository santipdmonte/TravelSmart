export interface Message {
  content: string;
  type: 'ai' | 'human';
  id: string;
  name?: string | null;
  example?: boolean;
  additional_kwargs?: Record<string, any>;
  response_metadata?: Record<string, any>;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
  usage_metadata?: Record<string, any>;
}

export interface AgentState {
  messages: Message[];
  itinerary: {
    nombre_viaje: string;
    cantidad_dias: number;
    destino_general: string;
    destinos: Array<{
      nombre_destino: string;
      cantidad_dias_en_destino: number;
      dias_destino: Array<{
        posicion_dia: number;
        actividades: string;
      }>;
    }>;
  };
  user_name: string;
  user_id: string;
}

export interface AgentResponse {
  0: AgentState;
  1: any[];
  2: {
    configurable: {
      thread_id: string;
      checkpoint_ns: string;
      checkpoint_id: string;
    };
  };
  3: {
    source: string;
    writes: {
      agent: {
        messages: Message[];
      };
    };
    step: number;
    parents: Record<string, any>;
    thread_id: string;
  };
  4: string; // timestamp
  5: {
    configurable: {
      thread_id: string;
      checkpoint_ns: string;
      checkpoint_id: string;
    };
  };
  6: any[];
}

export interface SendMessageRequest {
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 