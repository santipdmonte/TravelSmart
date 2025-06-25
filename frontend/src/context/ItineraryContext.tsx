import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  Dispatch,
  useReducer,
} from "react";
import { Itinerary, ItineraryAction } from "../types/travel";

// El reducer ahora opera sobre el tipo 'Itinerary'
const itineraryReducer = (
  state: Itinerary | null,
  action: ItineraryAction
): Itinerary | null => {
  switch (action.type) {
    case "SET_ITINERARY":
      return action.payload;
    case "CLEAR_ITINERARY":
      return null;
    default:
      return state;
  }
};

interface ItineraryContextType {
  itinerary: Itinerary | null;
  dispatch: Dispatch<ItineraryAction>;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

const ITINERARY_KEY = "travelsmart_itinerary";

// La función que obtiene datos de localStorage ahora espera un objeto 'Itinerary'
const getInitialState = (): Itinerary | null => {
  try {
    const stored = localStorage.getItem(ITINERARY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error al leer de localStorage", error);
    return null;
  }
};

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const [itinerary, dispatch] = useReducer(itineraryReducer, getInitialState());

  useEffect(() => {
    try {
      if (itinerary) {
        localStorage.setItem(ITINERARY_KEY, JSON.stringify(itinerary));
      } else {
        localStorage.removeItem(ITINERARY_KEY);
      }
    } catch (error) {
      console.error("Error al guardar en localStorage", error);
    }
  }, [itinerary]);

  return (
    <ItineraryContext.Provider value={{ itinerary, dispatch }}>
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItineraryContext = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error(
      "useItineraryContext must be used within an ItineraryProvider"
    );
  }
  return context;
};
