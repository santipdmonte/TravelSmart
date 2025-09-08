'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AgentState, Message, HILResponse } from '@/types/agent';

interface ChatState {
  isOpen: boolean;
  initializing: boolean;
  messages: Message[];
  loading: boolean;
  error: string | null;
  currentItinerary: AgentState['itinerary'] | null;
  threadId: string | null;
  hilState: HILResponse | null;
}

type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_INITIALIZING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AGENT_STATE'; payload: AgentState }
  | { type: 'SET_HIL_STATE'; payload: HILResponse | null }
  | { type: 'SET_THREAD_ID'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'APPEND_MESSAGE_CONTENT'; payload: { messageId: string; content: string } }
  | { type: 'CLEAR_CHAT' };

const initialState: ChatState = {
  isOpen: false,
  initializing: false,
  messages: [],
  loading: false,
  error: null,
  currentItinerary: null,
  threadId: null,
  hilState: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };
    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };
    case 'SET_INITIALIZING':
      return { ...state, initializing: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, initializing: false };
    case 'SET_AGENT_STATE':
      return {
        ...state,
        messages: action.payload.messages,
        currentItinerary: action.payload.itinerary,
        loading: false,
        initializing: false,
        error: null,
      };
    case 'SET_HIL_STATE':
      return { ...state, hilState: action.payload };
    case 'SET_THREAD_ID':
      return { ...state, threadId: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'APPEND_MESSAGE_CONTENT': {
      const { messageId, content } = action.payload;
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, content: `${m.content}${content}` } : m
        ),
      };
    }
    case 'CLEAR_CHAT':
      return initialState;
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 