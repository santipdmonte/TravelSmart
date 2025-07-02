export interface Message {
  content: string;
  type: 'ai' | 'human';
  id: string;
  name?: string | null;
  example?: boolean;
  additional_kwargs?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
  tool_calls?: ToolCall[];
  invalid_tool_calls?: unknown[];
  usage_metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  type: string;
  name: string;
  args: {
    new_itinerary?: unknown;
    new_itinerary_modifications_summary?: string;
  };
}

export interface HILResponse {
  isHIL: boolean;
  confirmationMessage?: string;
  proposedChanges?: unknown;
  summary?: string;
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
  1: unknown[];
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
    parents: Record<string, unknown>;
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
  6: unknown[];
}

export interface SendMessageRequest {
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 