import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AccommodationSearchPage = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const destino = query.get('destino');
  const fecha = query.get('fecha');
  const personas = query.get('personas');

  const missing = !destino || !fecha || !personas;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[700px] mx-auto p-4 px-6 md:px-8 pt-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Recomendación de Alojamiento</h1>
        {missing ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">
              Debes cargar la fecha de inicio del viaje y la cantidad de pasajeros para buscar alojamiento.
            </p>
            <Button variant="primary" onClick={() => navigate(-1)}>Volver</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Buscando alojamiento en:</span> {destino}
            </p>
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Fecha de inicio:</span> {fecha}
            </p>
            <p className="mb-4 text-gray-700">
              <span className="font-semibold">Cantidad de personas:</span> {personas}
            </p>
            <div className="mt-8 text-gray-500 italic">
              (Aquí se mostrarán las recomendaciones de alojamiento...)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationSearchPage; 