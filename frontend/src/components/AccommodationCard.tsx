// frontend/src/components/AccommodationCard.tsx

import { useNavigate } from "react-router-dom";
import { ItineraryDestination } from "../types/travel";
import Button from "./Button";

interface AccommodationCardProps {
  destinations: ItineraryDestination[];
  startDate?: string;
  numAdults?: number;
}

const AccommodationCard = ({ destinations, startDate, numAdults }: AccommodationCardProps) => {
  const navigate = useNavigate();

  const handleSearch = (destination: ItineraryDestination) => {
    // Verificamos que tengamos los datos necesarios antes de navegar
    if (!startDate || !numAdults) {
      alert("Por favor, ingresa la fecha de inicio y el número de personas para buscar alojamiento.");
      return;
    }

    const params = new URLSearchParams({
      destino: destination.destination_name,
      fecha: startDate, // Usamos la fecha de inicio general para simplificar
      personas: String(numAdults),
      noches: String(destination.days_in_destination),
    });

    navigate(`/accommodation-search?${params.toString()}`);
  };

  if (!destinations || destinations.length === 0) {
    return <p className="text-gray-500">No hay destinos en este itinerario.</p>;
  }

  return (
    <ul className="space-y-3">
      {destinations.map((dest, index) => (
        <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
          <div>
            <span className="font-semibold text-gray-800">{dest.destination_name}</span>
            <span className="text-sm text-gray-500 ml-2">({dest.days_in_destination} noches)</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => handleSearch(dest)}>
            Buscar Alojamiento
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default AccommodationCard;