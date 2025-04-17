import { useState } from 'react';
import Button from '../components/Button';
import AIPlanPage from './AIPlanPage';
import ManualPlanPage from './ManualPlanPage';
import logoImage from '../assets/logos/logo-v2-sin-bordes.png';
import heroImage from '../assets/img/hero-image.png';

// Define the possible modes
type PlanningMode = 'selection' | 'manual' | 'ai';

const HomePage = () => {
  const [mode, setMode] = useState<PlanningMode>('selection');

  const handleModeSelection = (selectedMode: PlanningMode) => {
    setMode(selectedMode);
  };

  // Display the appropriate page based on mode
  if (mode === 'ai') {
    return <AIPlanPage onBack={() => setMode('selection')} />;
  }

  if (mode === 'manual') {
    return <ManualPlanPage onBack={() => setMode('selection')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 shadow-md">
        <div className="container mx-auto p-4 flex items-center">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="TravelSmart Logo" className="h-10" />
            <div>
              <h1 className="text-3xl font-bold text-white">TravelSmart</h1>
              <p className="text-blue-100">Planifica tu próxima aventura</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="relative">
        <img 
          src={heroImage} 
          alt="Planifica tu viaje con TravelSmart" 
          className="w-full h-80 md:h-96 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold text-white mb-4">Tu viaje perfecto comienza aquí</h2>
              <p className="text-lg text-white/90 mb-6">
                Crea itinerarios personalizados o deja que nuestra IA planifique tu próxima aventura.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-6 max-w-4xl -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo quieres planificar tu viaje?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Plan de viaje manual</h3>
              <p className="text-gray-600 mb-4 text-center">
                Crea tu propio itinerario personalizado día a día con actividades a tu elección.
              </p>
              <Button 
                onClick={() => handleModeSelection('manual')} 
                variant="outline"
                className="mt-auto"
              >
                Crear plan manual
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-6 border border-gray-200 rounded-lg bg-blue-50 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Plan de viaje con IA</h3>
              <p className="text-gray-600 mb-4 text-center">
                Deja que nuestra inteligencia artificial genere un itinerario basado en tu destino y duración.
              </p>
              <Button 
                onClick={() => handleModeSelection('ai')} 
                variant="primary"
                className="mt-auto"
              >
                Crear plan con IA
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} TravelSmart - Planificación inteligente de viajes</p>
      </footer>
    </div>
  );
};

export default HomePage; 