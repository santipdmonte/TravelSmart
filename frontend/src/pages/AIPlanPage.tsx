import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItineraryContext } from "../context/ItineraryContext";
import TravelPlanForm from "../components/TravelPlanForm";
import TravelPlanDisplay from "../components/TravelPlanDisplay";
import Button from "../components/Button";
import Navbar from "../components/Navbar";

import { generateItinerary } from "../services/travelService";
import { Itinerary } from "../types/travel";

const AIPlanPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado local para guardar la PREVISUALIZACIÓN del itinerario
  const [previewItinerary, setPreviewItinerary] = useState<Itinerary | null>(
    null
  );

  const { dispatch } = useItineraryContext();
  const navigate = useNavigate();

  // 1. El formulario llama a esta función para generar la vista previa
  const handleGeneratePreview = async (data: {
    trip_name: string;
    days: number;
  }) => {
    setIsLoading(true);
    setError(null);
    setPreviewItinerary(null); // Limpiamos la previsualización anterior
    try {
      const newItinerary = await generateItinerary(data);
      // Guardamos el resultado en el estado LOCAL
      setPreviewItinerary(newItinerary);
    } catch (err) {
      setError(
        "Error al crear el plan de viaje. Por favor intente nuevamente."
      );
      console.error("Error details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. El botón de confirmar llama a esta función
  const handleConfirmItinerary = () => {
    if (previewItinerary) {
      // Guardamos el plan del estado local al estado GLOBAL (Context)
      dispatch({ type: "SET_ITINERARY", payload: previewItinerary });
      // Navegamos a la página principal del itinerario donde se podrá editar
      navigate("/itinerary");
    }
  };

  return (
    <div className="min-h-screen bg-travel-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-[1200px] mx-auto p-4 px-6 md:px-8 pt-20">
          {!previewItinerary && ( // Mostramos el formulario solo si NO hay una previsualización
            <>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="mb-4"
              >
                ← Volver
              </Button>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Plan de viaje con IA
              </h1>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <TravelPlanForm
                  onSubmit={handleGeneratePreview}
                  isLoading={isLoading}
                />
                {error && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Si hay un itinerario en el estado local, mostramos la previsualización */}
          {previewItinerary && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Vista Previa del Plan
              </h2>
              <TravelPlanDisplay plan={previewItinerary} />
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  onClick={handleConfirmItinerary}
                  className="w-full"
                >
                  Confirmar y Continuar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPreviewItinerary(null)} // Botón para volver a generar
                  className="w-full"
                >
                  Generar de Nuevo
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-travel-text-dark text-travel-text-light p-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} TravelSmart - Planificación inteligente
          de viajes
        </p>
      </footer>
    </div>
  );
};

export default AIPlanPage;
