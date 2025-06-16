import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  Dispatch,
  useReducer,
} from "react";
import { ViajeState, ItineraryAction } from "../types/travel";

const itineraryReducer = (
  state: ViajeState | null,
  action: ItineraryAction
): ViajeState | null => {
  switch (action.type) {
    case "SET_ITINERARY":
      // Reemplaza el estado actual con el nuevo itinerario del payload
      return action.payload;

    case "UPDATE_DETAILS":
      // Si no hay estado, no hagas nada
      if (!state) {
        return state;
      }
      // Combina el estado anterior con los nuevos detalles del payload
      return { ...state, ...action.payload };

    case "CLEAR_ITINERARY":
      // Devuelve null para limpiar el estado
      return null;

    default:
      // Si la acción no es reconocida, devuelve el estado sin cambios
      return state;
  }
};

interface ItineraryContextType {
  itinerary: ViajeState | null;
  dispatch: Dispatch<ItineraryAction>; // Expondremos dispatch en lugar de las funciones set
}

// Creamos el contexto
const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

const ITINERARY_KEY = "travelsmart_itinerary";

// Función para obtener el estado inicial desde localStorage
const getInitialState = (): ViajeState | null => {
  try {
    const stored = localStorage.getItem(ITINERARY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error al leer de localStorage", error);
    return null;
  }
};

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  // Usamos useReducer en lugar de useState
  // El primer argumento es el reducer, el segundo es el estado inicial
  const [itinerary, dispatch] = useReducer(itineraryReducer, getInitialState());

  // Este useEffect se ejecuta CADA VEZ que el estado 'itinerary' cambia
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

// El custom hook ahora devuelve el estado y la función dispatch
export const useItineraryContext = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error(
      "useItineraryContext must be used within an ItineraryProvider"
    );
  }
  return context;
};
