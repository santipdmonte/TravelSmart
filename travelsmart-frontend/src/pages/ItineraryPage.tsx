import { useNavigate } from 'react-router-dom';
import { useItineraryContext } from '../context/ItineraryContext';
import TravelPlanDisplay from '../components/TravelPlanDisplay';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

const ItineraryPage = () => {
  const { itinerary, clearItinerary } = useItineraryContext();
  const navigate = useNavigate();

  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Navbar />
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">No hay itinerario confirmado</h2>
          <Button variant="primary" onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[1200px] mx-auto p-4 px-6 md:px-8 pt-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Itinerario Actual</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <TravelPlanDisplay plan={itinerary} />
        </div>
        <div className="flex gap-4">
          {/* Botones para futuras funcionalidades */}
          <Button variant="secondary" disabled>Editar (próximamente)</Button>
          <Button variant="secondary" disabled>Compartir</Button>
          <Button variant="secondary" disabled>Exportar</Button>
          <Button variant="outline" onClick={clearItinerary}>Borrar itinerario</Button>
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} TravelSmart - Planificación inteligente de viajes</p>
      </footer>
    </div>
  );
};

export default ItineraryPage;
