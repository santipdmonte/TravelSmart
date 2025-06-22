// frontend/src/pages/ItineraryPage.tsx

import { useNavigate } from "react-router-dom";
import { useItineraryContext } from "../context/ItineraryContext";
import TravelPlanDisplay from "../components/TravelPlanDisplay";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import AccommodationCard from "../components/AccommodationCard"; // <- Importamos el nuevo componente
import { Itinerary } from "../types/travel";
import { useState, useEffect } from "react";

const ItineraryPage = () => {
  const { itinerary, dispatch } = useItineraryContext();
  const navigate = useNavigate();

  // Estados locales para los detalles que el usuario debe ingresar
  const [startDate, setStartDate] = useState(itinerary?.start_date || "");
  const [numAdults, setNumAdults] = useState(itinerary?.num_adults || 1);

  // Guardamos los cambios en el contexto global cuando el usuario los modifica
  const handleDetailsChange = <K extends keyof Itinerary>(
    field: K,
    value: Itinerary[K]
  ) => {
    // NOTA: Esta es una forma simplificada. En una app real, usarías el 'dispatch' del context.
    // Por ahora, actualizamos el estado local para que la UI funcione.
    if (field === "start_date") {
      setStartDate(value as string);
    }
    if (field === "num_adults") {
      setNumAdults(Number(value));
    }
  };

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No hay itinerario activo</h2>
          <Button variant="primary" onClick={() => navigate("/")}>
            Crear un nuevo plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="pt-24">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* El resto del contenido va aquí dentro sin cambios */}

          {/* Componente principal del plan */}
          <div className="mb-8">
            <TravelPlanDisplay plan={itinerary} />
          </div>

          {/* Formulario para detalles adicionales */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Completa tu Viaje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fecha de Inicio del Viaje
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) =>
                    handleDetailsChange("start_date", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="num-adults"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de Personas
                </label>
                <input
                  type="number"
                  id="num-adults"
                  min="1"
                  value={numAdults}
                  onChange={(e) =>
                    handleDetailsChange("num_adults", Number(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sección de Alojamiento */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Alojamiento
            </h2>
            <AccommodationCard
              destinations={itinerary.destinations}
              startDate={startDate}
              numAdults={numAdults}
            />
          </div>

          {/* Sección de Traslados (Placeholder) */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Traslados</h2>
            <p className="text-gray-500">
              No hay información de traslados disponible.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 flex-wrap justify-center p-4">
            <Button variant="secondary" disabled>
              Editar Plan
            </Button>
            <Button variant="secondary" disabled>
              Compartir
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                dispatch({ type: "CLEAR_ITINERARY" });
                navigate("/");
              }}
            >
              Borrar y empezar de nuevo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItineraryPage;
