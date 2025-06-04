import { useNavigate } from 'react-router-dom';
import { useItineraryContext } from '../context/ItineraryContext';
import TravelPlanDisplay from '../components/TravelPlanDisplay';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { getAccommodations } from '../services/accommodations';
import { getTransportations } from '../services/transportationService';

const ItineraryPage = () => {
  const { itinerary, setItinerary, clearItinerary } = useItineraryContext();
  const navigate = useNavigate();

  // Estado para alojamientos y traslados
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [transportations, setTransportations] = useState<any[]>([]);

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
          <h2 className="text-2xl font-bold mb-4">No hay itinerario confirmado</h2>
          <Button variant="primary" onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Handlers para actualizar los campos directamente en el contexto
  const handleFechaSalida = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItinerary({ ...itinerary, fecha_salida: e.target.value });
  };
  const handlePersonas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItinerary({ ...itinerary, cantidad_personas: value === '' ? undefined : Number(value) });
  };
  const handleNinos = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItinerary({ ...itinerary, cantidad_ninos: Number(e.target.value) });
  };

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
              value={itinerary.fecha_salida || ''}
              onChange={handleFechaSalida}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas</label>
            <input
              type="number"
              min={1}
              value={itinerary.cantidad_personas === undefined ? '' : itinerary.cantidad_personas}
              onChange={handlePersonas}
              className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
            <input
              type="number"
              min={0}
              value={itinerary.cantidad_ninos ?? 0}
              onChange={handleNinos}
              className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <TravelPlanDisplay plan={itinerary} compact />
        </div>
        {/* Sección de Alojamiento */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Alojamiento</h2>
          {accommodations.length === 0 ? (
            <p className="text-gray-500">No hay información de alojamiento disponible.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {accommodations.map((a, idx) => (
                <li key={idx} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4 justify-between">
                  <div>
                    <span className="font-semibold text-blue-700">{a.ciudad}</span>
                    <span className="text-gray-700 ml-2">Días {a.desde_dia} a {a.hasta_dia} ({a.noches} noches)</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2 md:mt-0"
                    onClick={() => {
                      if (!itinerary.fecha_salida || !itinerary.cantidad_personas) {
                        alert('Debes cargar la fecha de inicio del viaje y la cantidad de pasajeros para buscar alojamiento.');
                        return;
                      }
                      navigate(`/accommodation-search?destino=${encodeURIComponent(a.ciudad)}&fecha=${encodeURIComponent(itinerary.fecha_salida || '')}&personas=${itinerary.cantidad_personas}`);
                    }}
                  >
                    Buscar alojamiento
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Sección de Traslados */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Traslados</h2>
          {transportations.length === 0 ? (
            <p className="text-gray-500">No hay información de traslados disponible.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {transportations.map((t, idx) => (
                <li key={idx} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
                  <span className="font-semibold text-blue-700">Día {t.dia}:</span>
                  <span className="text-gray-700">{t.origen} → {t.destino} ({t.tipo})</span>
                  <span className="text-gray-500 text-sm">{t.descripcion}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
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
