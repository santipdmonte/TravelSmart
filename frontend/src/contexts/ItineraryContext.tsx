'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Itinerary } from '@/types/itinerary';

interface ItineraryState {
  itineraries: Itinerary[];
  currentItinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
}

type ItineraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITINERARIES'; payload: Itinerary[] }
  | { type: 'SET_CURRENT_ITINERARY'; payload: Itinerary | null }
  | { type: 'ADD_ITINERARY'; payload: Itinerary }
  | { type: 'UPDATE_ITINERARY'; payload: Itinerary }
  | { type: 'CLEAR_STATE' };

const initialState: ItineraryState = {
  itineraries: [],
  currentItinerary: null,
  loading: false,
  error: null,
};

function itineraryReducer(state: ItineraryState, action: ItineraryAction): ItineraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ITINERARIES':
      return { ...state, itineraries: action.payload, loading: false, error: null };
    case 'SET_CURRENT_ITINERARY':
      return { ...state, currentItinerary: action.payload, loading: false, error: null };
    case 'ADD_ITINERARY':
      return {
        ...state,
        itineraries: [action.payload, ...state.itineraries],
        loading: false,
        error: null,
      };
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.map(itinerary =>
          itinerary.itinerary_id === action.payload.itinerary_id
            ? action.payload
            : itinerary
        ),
        currentItinerary: state.currentItinerary?.itinerary_id === action.payload.itinerary_id
          ? action.payload
          : state.currentItinerary,
        loading: false,
        error: null,
      };
    case 'CLEAR_STATE':
      return initialState;
    default:
      return state;
  }
}

interface ItineraryContextType extends ItineraryState {
  dispatch: React.Dispatch<ItineraryAction>;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(itineraryReducer, initialState);

  return (
    <ItineraryContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
} 