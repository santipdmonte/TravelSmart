import { useState, ChangeEvent } from 'react';
import Button from './Button';
import { ViajeStateInput } from '../types/travel';

interface TravelPlanFormProps {
  onSubmit: (data: ViajeStateInput) => void;
  isLoading: boolean;
}

const TravelPlanForm = ({ onSubmit, isLoading }: TravelPlanFormProps) => {
  const [destino, setDestino] = useState('');
  const [cantidadDias, setCantidadDias] = useState(5);
  const [diasInputValue, setDiasInputValue] = useState('5'); // Track the actual string input value

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have at least 1 day before submitting
    const dias = Math.max(1, cantidadDias);
    
    onSubmit({
      destino,
      cantidad_dias: dias,
    });
  };

  const handleDiasChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiasInputValue(value);
    
    // Only set the numeric value if it's not empty, otherwise default to 0
    // This allows emptying the field but will submit with at least 1 day
    setCantidadDias(value === '' ? 0 : parseInt(value, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label htmlFor="destino" className="block text-gray-700 text-sm font-bold mb-2">
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
      
      <div className="mb-6">
        <label htmlFor="cantidad-dias" className="block text-gray-700 text-sm font-bold mb-2">
          Cantidad de días
        </label>
        <input
          id="cantidad-dias"
          type="text" // Changed from number to text to allow empty input
          inputMode="numeric" // Ensures numeric keyboard on mobile
          pattern="[0-9]*" // Ensures only numbers can be entered
          min="1"
          max="30"
          value={diasInputValue}
          onChange={handleDiasChange}
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
        {isLoading ? 'Creando plan...' : 'Crear plan de viaje'}
      </Button>
    </form>
  );
};

export default TravelPlanForm; 