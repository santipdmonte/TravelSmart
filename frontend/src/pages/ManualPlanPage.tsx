import { useNavigate } from "react-router-dom";
import { useItineraryContext } from "../context/ItineraryContext";
import Button from "../components/Button";
import DayForm from "../components/DayForm";
import TravelPlanDisplay from "../components/TravelPlanDisplay";
import logoImage from "../assets/logos/logo-v2-sin-bordes.png";
import Navbar from "../components/Navbar";
import { useManualPlan } from "../hooks/useManualPlan.ts";

const ManualPlanPage = () => {
  const {
    destino,
    setDestino,
    showPreview,
    dias,
    handleAddDay,
    handleRemoveDay,
    handleUpdateDay,
    handlePreview,
    handleEdit,
    getPlan,
    isValid,
    totalActivities,
  } = useManualPlan();

  const { setItinerary } = useItineraryContext();
  const navigate = useNavigate();

  const handleConfirm = () => {
    setItinerary(getPlan());
    navigate("/itinerary");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[1400px] mx-auto p-4 px-6 md:px-8 pt-20">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-4"
        >
          ← Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Plan de viaje manual
        </h1>
        {showPreview ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Vista previa del plan
              </h2>
              <Button variant="secondary" onClick={handleEdit}>
                Volver a editar
              </Button>
            </div>
            <TravelPlanDisplay plan={getPlan()} />
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={handleConfirm}
                className="w-full"
              >
                Confirmar itinerario
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Crear plan de viaje manual
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="destino"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Destino
                </label>
                <input
                  id="destino"
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Ej: Italia, Japón, Australia..."
                  required
                />
              </div>
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Itinerario</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {dias.length} {dias.length === 1 ? "día" : "días"}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {totalActivities}{" "}
                      {totalActivities === 1 ? "actividad" : "actividades"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {dias.map((dia, index) => (
                <DayForm
                  key={dia.posicion_dia}
                  day={dia}
                  onUpdate={(updatedDay) => handleUpdateDay(index, updatedDay)}
                  onRemove={() => handleRemoveDay(index)}
                />
              ))}
            </div>
            <div className="mt-4 mb-6">
              <Button
                variant="secondary"
                onClick={handleAddDay}
                className="w-full"
              >
                Agregar día
              </Button>
            </div>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={handlePreview}
                className="w-full"
                disabled={!isValid}
              >
                Confirmar itinerario
              </Button>
              {!isValid && (
                <p className="text-sm text-red-500 mt-2">
                  Para continuar, asegúrate de ingresar un destino y al menos
                  una actividad por día.
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p className="text-sm">
          © {new Date().getFullYear()} TravelSmart - Planificación inteligente
          de viajes
        </p>
      </footer>
    </div>
  );
};

export default ManualPlanPage;
