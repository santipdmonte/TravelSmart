import { useNavigate } from "react-router-dom";
import { useItineraryContext } from "../context/ItineraryContext";
import TravelPlanDisplay from "../components/TravelPlanDisplay";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { getAccommodations } from "../services/accommodations";
import { getTransportations } from "../services/transportationService";
import {
  AccommodationState,
  TransportationState,
  ViajeState,
} from "../types/travel";

const ItineraryPage = () => {
  const { itinerary, dispatch } = useItineraryContext();
  const navigate = useNavigate();

  // Estado para alojamientos y traslados
  const [accommodations, setAccommodations] = useState<AccommodationState[]>(
    []
  );
  const [transportations, setTransportations] = useState<TransportationState[]>(
    []
  );

  useEffect(() => {
    if (itinerary?.destino) {
      getAccommodations(itinerary.destino).then(setAccommodations);
      getTransportations(itinerary.destino).then(setTransportations);
    }
  }, [itinerary?.destino]);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Navbar />
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">
            No hay itinerario confirmado
          </h2>
          <Button variant="primary" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Handler para actualizar los campos directamente en el contexto
  const handleDetailsChange = <K extends keyof ViajeState>(
    field: K,
    value: ViajeState[K]
  ) => {
    dispatch({
      type: "UPDATE_DETAILS",
      payload: { [field]: value },
    });
  };

  return (
    <div className="min-h-screen bg-travel-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto p-4 px-6 md:px-8 pt-20">
        <h1 className="text-3xl font-bold text-travel-text-dark mb-4">
          Itinerario Actual
        </h1>

        {/* Formulario de datos adicionales con estilos del tema */}
        <div className="bg-travel-surface rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-travel-text mb-1">
              Fecha de salida
            </label>
            <input
              type="date"
              value={itinerary.fecha_salida || ""}
              onChange={(e) =>
                handleDetailsChange("fecha_salida", e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-travel-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-travel-text mb-1">
              Personas
            </label>
            <input
              type="number"
              min={1}
              value={itinerary.cantidad_personas ?? ""}
              onChange={(e) =>
                handleDetailsChange(
                  "cantidad_personas",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-travel-primary"
              placeholder="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-travel-text mb-1">
              Niños
            </label>
            <input
              type="number"
              min={0}
              value={itinerary.cantidad_ninos ?? 0}
              onChange={(e) =>
                handleDetailsChange("cantidad_ninos", Number(e.target.value))
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-travel-primary"
            />
          </div>
        </div>

        {/* El TravelPlanDisplay ahora mostrará las tarjetas compactas estilizadas */}
        <TravelPlanDisplay plan={itinerary} compact />

        {/* Sección de Alojamiento Estilizada */}
        <section className="bg-travel-surface rounded-lg shadow-md p-6 my-8">
          <h2 className="text-2xl font-bold text-travel-text-dark mb-4">
            Alojamiento
          </h2>
          {accommodations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {accommodations.map((a, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-travel-primary">
                      {a.ciudad}
                    </span>
                    <span className="text-travel-text ml-2">
                      Días {a.desde_dia} a {a.hasta_dia} ({a.noches} noches)
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      /* ... tu lógica de navegación ... */
                    }}
                  >
                    Buscar alojamiento
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-travel-text">
              No hay información de alojamiento disponible.
            </p>
          )}
        </section>

        {/* Sección de Traslados Estilizada */}
        <section className="bg-travel-surface rounded-lg shadow-md p-6 my-8">
          <h2 className="text-2xl font-bold text-travel-text-dark mb-4">
            Traslados
          </h2>
          {transportations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transportations.map((t, idx) => (
                <li key={idx} className="py-3">
                  <span className="font-semibold text-travel-primary">
                    Día {t.dia}:{" "}
                  </span>
                  <span className="text-travel-text">
                    {t.origen} → {t.destino} ({t.tipo})
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{t.descripcion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-travel-text">
              No hay información de traslados disponible.
            </p>
          )}
        </section>

        <div className="flex gap-4 flex-wrap justify-center p-4">
          <Button variant="secondary" disabled>
            Editar
          </Button>
          <Button variant="secondary" disabled>
            Compartir
          </Button>
          <Button variant="secondary" disabled>
            Exportar
          </Button>
          <Button variant="secondary" disabled>
            Encontrar Traslados
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "CLEAR_ITINERARY" })}
          >
            Borrar y empezar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
