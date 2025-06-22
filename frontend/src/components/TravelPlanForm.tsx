import { useState, ChangeEvent, FormEvent } from "react";
import Button from "./Button";

// Definimos aquí mismo el tipo de dato que el componente debe enviar
interface FormData {
  trip_name: string;
  days: number;
}

interface TravelPlanFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const TravelPlanForm = ({ onSubmit, isLoading }: TravelPlanFormProps) => {
  const [tripName, setTripName] = useState(""); // Cambiamos el nombre del estado para mayor claridad
  const [days, setDays] = useState(5);
  const [daysInputValue, setDaysInputValue] = useState("5");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalDays = Math.max(1, days);

    // CORRECCIÓN: Enviamos el objeto con los nombres de propiedad correctos
    onSubmit({
      trip_name: tripName,
      days: finalDays,
    });
  };

  const handleDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDaysInputValue(value);
    setDays(value === "" ? 0 : parseInt(value, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label
          htmlFor="destino"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Destino o Nombre del Viaje
        </label>
        <input
          id="destino"
          type="text"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Ej: Aventura en la Patagonia"
          required
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="cantidad-dias"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Cantidad de días
        </label>
        <input
          id="cantidad-dias"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          min="1"
          max="30"
          value={daysInputValue}
          onChange={handleDaysChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Generando Previsualización..." : "Generar Plan de Viaje"}
      </Button>
    </form>
  );
};

export default TravelPlanForm;
