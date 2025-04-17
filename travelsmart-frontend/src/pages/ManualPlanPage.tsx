import { useState } from 'react';
import { ViajeState, DiaViajeState } from '../types/travel';
import Button from '../components/Button';
import DayForm from '../components/DayForm';
import TravelPlanDisplay from '../components/TravelPlanDisplay';
import logoImage from '../assets/logos/logo-v2-sin-bordes.png';

interface ManualPlanPageProps {
  onBack: () => void;
}

const ManualPlanPage = ({ onBack }: ManualPlanPageProps) => {
  const [destino, setDestino] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dias, setDias] = useState<DiaViajeState[]>([
    {
      posicion_dia: 1,
      actividades: []
    }
  ]);

  const handleAddDay = () => {
    const newDay: DiaViajeState = {
      posicion_dia: dias.length + 1,
      actividades: []
    };
    setDias([...dias, newDay]);
  };

  const handleRemoveDay = (index: number) => {
    if (dias.length <= 1) {
      return; // Keep at least one day
    }
    
    const updatedDias = [...dias];
    updatedDias.splice(index, 1);
    
    // Reorder days
    const reorderedDias = updatedDias.map((dia, idx) => ({
      ...dia,
      posicion_dia: idx + 1
    }));
    
    setDias(reorderedDias);
  };

  const handleUpdateDay = (index: number, updatedDay: DiaViajeState) => {
    const updatedDias = [...dias];
    updatedDias[index] = updatedDay;
    setDias(updatedDias);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const getPlan = (): ViajeState => {
    return {
      destino,
      cantidad_dias: dias.length,
      dias_viaje: dias
    };
  };

  const isValid = destino.trim() !== '' && 
    dias.every(dia => dia.actividades.length > 0);

  // Count total activities across all days
  const totalActivities = dias.reduce((total, dia) => total + dia.actividades.length, 0);

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
              <p className="text-blue-100">Crea tu plan de viaje personalizado</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 max-w-4xl">
        {showPreview ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Vista previa del plan</h2>
              <Button 
                variant="secondary" 
                onClick={handleEdit}
              >
                Volver a editar
              </Button>
            </div>
            <TravelPlanDisplay plan={getPlan()} />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Crear plan de viaje manual</h2>
              
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
              
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Itinerario</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {dias.length} {dias.length === 1 ? 'día' : 'días'}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {totalActivities} {totalActivities === 1 ? 'actividad' : 'actividades'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {dias.map((dia, index) => (
                <DayForm
                  key={dia.posicion_dia}
                  day={dia}
                  onUpdate={(updatedDay) => handleUpdateDay(index, updatedDay)}
                  onRemove={() => handleRemoveDay(index)}
                />
              ))}
            </div>
            
            <div className="mt-4 mb-6">
              <Button 
                variant="secondary"
                onClick={handleAddDay}
                className="w-full"
              >
                Agregar día
              </Button>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="primary" 
                onClick={handlePreview} 
                className="w-full"
                disabled={!isValid}
              >
                Ver plan completo
              </Button>
              
              {!isValid && (
                <p className="text-sm text-red-500 mt-2">
                  Para continuar, asegúrate de ingresar un destino y al menos una actividad por día.
                </p>
              )}
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} TravelSmart - Planificación inteligente de viajes</p>
      </footer>
    </div>
  );
};

export default ManualPlanPage; 