import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItineraryContext } from '../context/ItineraryContext';
import TravelPlanDisplay from '../components/TravelPlanDisplay';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

const ItineraryPage = () => {
  const { itinerary, clearItinerary } = useItineraryContext();
  const navigate = useNavigate();

  // Estado local para los datos adicionales
  const [fechaSalida, setFechaSalida] = useState('');
  const [personas, setPersonas] = useState(2);
  const [ninos, setNinos] = useState(0);

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
        {/* Formulario de datos adicionales */}
        <form className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida</label>
            <input
              type="date"
              value={fechaSalida}
              onChange={e => setFechaSalida(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas</label>
            <input
              type="number"
              min={1}
              value={personas}
              onChange={e => setPersonas(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
            <input
              type="number"
              min={0}
              value={ninos}
              onChange={e => setNinos(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <TravelPlanDisplay plan={itinerary} compact />
        </div>
        <div className="flex gap-4 flex-wrap">
          {/* Botones para futuras funcionalidades */}
          <Button variant="secondary" disabled>Editar</Button>
          <Button variant="secondary" disabled>Compartir</Button>
          <Button variant="secondary" disabled>Exportar</Button>
          <Button variant="secondary" disabled>Encontrar Hoteles</Button>
          <Button variant="secondary" disabled>Encontrar Traslados</Button>
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
