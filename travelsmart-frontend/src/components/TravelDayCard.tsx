import { DiaViajeState } from '../types/travel';
import ActivityItem from './ActivityItem';

interface TravelDayCardProps {
  dia: DiaViajeState;
}

const TravelDayCard = ({ dia }: TravelDayCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-500 text-white p-4">
        <h3 className="text-xl font-bold">Día {dia.posicion_dia}</h3>
      </div>
      
      <div className="p-4">
        <ul className="divide-y divide-gray-200">
          {dia.actividades.map((actividad, index) => (
            <ActivityItem key={index} actividad={actividad} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TravelDayCard; 