import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { generateHotelLinks } from '../services/accommodations';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AccommodationSearchPage = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const destino = query.get('destino');
  const fecha = query.get('fecha');
  const personas = query.get('personas');
  const noches = query.get('noches');

  // Calcular fecha de check-out si es posible
  let checkOut = '';
  if (fecha && noches) {
    const checkInDate = new Date(fecha);
    checkInDate.setDate(checkInDate.getDate() + Number(noches));
    checkOut = checkInDate.toISOString().slice(0, 10);
  }

  const missingFields: string[] = [];
  if (!destino) missingFields.push('destino');
  if (!fecha) missingFields.push('fecha de inicio');
  if (!personas) missingFields.push('cantidad de personas');
  if (!noches) missingFields.push('cantidad de noches');

  const missing = missingFields.length > 0;

  let links = null;
  if (!missing) {
    links = generateHotelLinks(destino!, fecha!, checkOut, Number(personas));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[700px] mx-auto p-4 px-6 md:px-8 pt-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Buscar alojamiento en {destino}</h1>
        {missing ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">
              Faltan datos para generar la búsqueda. Por favor vuelve y completa la información.
            </p>
            <ul className="mb-4 text-red-500 text-sm list-disc list-inside">
              {missingFields.map((field, idx) => (
                <li key={idx}>{field.charAt(0).toUpperCase() + field.slice(1)}</li>
              ))}
            </ul>
            <Button variant="primary" onClick={() => navigate(-1)}>Volver</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Destino:</span> {destino}
            </p>
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Check-in:</span> {fecha}
            </p>
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Check-out:</span> {checkOut}
            </p>
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Personas:</span> {personas}
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <a href={links!.booking} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">Buscar en Booking.com</a>
              <a href={links!.airbnb} target="_blank" rel="noopener noreferrer" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition">Buscar en Airbnb</a>
              <a href={links!.expedia} target="_blank" rel="noopener noreferrer" className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded transition">Buscar en Expedia</a>
              <a href={links!.hotels} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition">Buscar en Hotels.com</a>
            </div>
            <div className="mt-8 text-gray-500 italic">
              (En el futuro aquí se mostrarán recomendaciones personalizadas por IA)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationSearchPage; 