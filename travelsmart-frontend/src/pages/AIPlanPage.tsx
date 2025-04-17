import { useState } from 'react';
import TravelPlanForm from '../components/TravelPlanForm';
import TravelPlanDisplay from '../components/TravelPlanDisplay';
import Button from '../components/Button';
import { ViajeState, ViajeStateInput } from '../types/travel';
import { createTravelPlan } from '../services/travelService';
import logoImage from '../assets/logos/logo-v2-sin-bordes.png';

interface AIPlanPageProps {
  onBack: () => void;
}

const AIPlanPage = ({ onBack }: AIPlanPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelPlan, setTravelPlan] = useState<ViajeState | null>(null);

  const handleCreatePlan = async (data: ViajeStateInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const plan = await createTravelPlan(data);
      setTravelPlan(plan);
    } catch (err) {
      setError('Error al crear el plan de viaje. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 shadow-md">
        <div className="container mx-auto p-4 flex items-center">
          <button 
            onClick={onBack}
            className="mr-4 text-white hover:text-blue-200 focus:outline-none"
            aria-label="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="TravelSmart Logo" className="h-10" />
            <div>
              <h1 className="text-3xl font-bold text-white">TravelSmart</h1>
              <p className="text-blue-100">Planifica tu próxima aventura con IA</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Crear plan de viaje con IA</h2>
          <TravelPlanForm onSubmit={handleCreatePlan} isLoading={isLoading} />
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        
        {travelPlan && (
          <div className="mt-8">
            <TravelPlanDisplay plan={travelPlan} />
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} TravelSmart - Planificación inteligente de viajes</p>
      </footer>
    </div>
  );
};

export default AIPlanPage; 