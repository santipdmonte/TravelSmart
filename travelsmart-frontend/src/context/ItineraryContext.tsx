import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViajeState } from '../types/travel';

interface ItineraryContextType {
  itinerary: ViajeState | null;
  setItinerary: (itinerary: ViajeState) => void;
  clearItinerary: () => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

const ITINERARY_KEY = 'travelsmart_itinerary';

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const [itinerary, setItineraryState] = useState<ViajeState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ITINERARY_KEY);
    if (stored) {
      setItineraryState(JSON.parse(stored));
    }
  }, []);

  const setItinerary = (itinerary: ViajeState) => {
    setItineraryState(itinerary);
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(itinerary));
  };

  const clearItinerary = () => {
    setItineraryState(null);
    localStorage.removeItem(ITINERARY_KEY);
  };

  return (
    <ItineraryContext.Provider value={{ itinerary, setItinerary, clearItinerary }}>
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItineraryContext = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItineraryContext must be used within an ItineraryProvider');
  }
  return context;
}; 