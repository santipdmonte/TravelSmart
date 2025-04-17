import { ViajeState } from '../types/travel';
import TravelDayCard from './TravelDayCard';

interface TravelPlanDisplayProps {
  plan: ViajeState;
}

const TravelPlanDisplay = ({ plan }: TravelPlanDisplayProps) => {
  return (
    <div className="w-full">
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold">Plan de viaje: {plan.destino}</h2>
        <p className="text-blue-100">Duración: {plan.cantidad_dias} días</p>
      </div>
      
      <div className="space-y-6 mt-6">
        {plan.dias_viaje.map((dia) => (
          <TravelDayCard key={dia.posicion_dia} dia={dia} />
        ))}
      </div>
    </div>
  );
};

export default TravelPlanDisplay; 