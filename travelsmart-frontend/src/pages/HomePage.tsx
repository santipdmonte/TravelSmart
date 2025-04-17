import { useState } from 'react';
import Button from '../components/Button';
import AIPlanPage from './AIPlanPage';
import ManualPlanPage from './ManualPlanPage';
import Navbar from '../components/Navbar';
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
      <Navbar />
      
      {/* Hero Section with extra height */}
      <div className="relative pt-16">
        <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
          <img 
            src={heroImage} 
            alt="Planifica tu viaje con TravelSmart" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 pt-20 bg-gradient-to-r from-blue-900/80 via-blue-800/50 to-transparent flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex flex-col lg:flex-row items-start justify-between">
            <div className="max-w-lg lg:mr-16 xl:mr-24">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Tu viaje perfecto comienza aquí
              </h2>
              <p className="text-lg md:text-xl text-white mb-6 drop-shadow-md">
                Crea itinerarios personalizados o deja que nuestra IA planifique tu próxima aventura.
              </p>
            </div>
            
            {/* Card moved inside the hero section */}
            <div className="w-full sm:max-w-[500px] lg:max-w-[600px] mx-auto lg:mx-0 mt-10 lg:mt-0 backdrop-blur-md bg-white/20 rounded-lg shadow-lg border border-white/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">¿Cómo quieres planificar tu viaje?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col p-5 border border-white/30 rounded-lg backdrop-blur-sm bg-blue-700/30 hover:bg-blue-700/40 transition-all">
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">Plan de viaje manual</h3>
                  <p className="text-white/90 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                    Crea tu propio itinerario personalizado día a día con actividades a tu elección.
                  </p>
                  <Button 
                    onClick={() => handleModeSelection('manual')} 
                    variant="outline"
                    className="mt-auto bg-white/90 hover:bg-white border-white/80 text-blue-800 self-center w-full sm:w-auto"
                  >
                    Crear plan manual
                  </Button>
                </div>
                
                <div className="flex flex-col p-5 border border-white/30 rounded-lg backdrop-blur-sm bg-blue-500/30 hover:bg-blue-500/40 transition-all">
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">Plan de viaje con IA</h3>
                  <p className="text-white/90 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                    Deja que nuestra inteligencia artificial genere un itinerario basado en tu destino y duración.
                  </p>
                  <Button 
                    onClick={() => handleModeSelection('ai')} 
                    variant="primary"
                    className="mt-auto bg-blue-600 hover:bg-blue-700 self-center w-full sm:w-auto"
                  >
                    Crear plan con IA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Removed the old card section that was positioned below */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 relative z-10">
        {/* Content removed as it's now in the hero section */}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto w-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <p className="text-sm">© {new Date().getFullYear()} TravelSmart - Planificación inteligente de viajes</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 