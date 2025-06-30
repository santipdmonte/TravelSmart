import { DiaViajeState } from "../types/travel";
import ActivityItem from "./ActivityItem";

interface TravelDayCardProps {
  dia: DiaViajeState;
}

const TravelDayCard = ({ dia }: TravelDayCardProps) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden bg-travel-surface">
      <div className="bg-travel-primary p-4">
        <h3 className="text-xl font-bold text-travel-text-light">
          Día {dia.posicion_dia}
        </h3>
      </div>
      <div className="p-4">
        <ul className="space-y-4 divide-y divide-gray-200">
          {dia.actividades.map((actividad, index) => (
            <li key={index} className={index > 0 ? "pt-4" : ""}>
              <ActivityItem actividad={actividad} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TravelDayCard;

// Versión compacta para visualización resumida
export const TravelDayCardCompact = ({ dia }: TravelDayCardProps) => {
  return (
    <div className="bg-white rounded shadow-sm border border-gray-200">
      <div className="bg-blue-100 text-blue-900 p-2 flex items-center gap-2">
        <span className="font-semibold">Día {dia.posicion_dia}</span>
        <span className="text-xs text-blue-700">
          ({dia.actividades.length} actividades)
        </span>
      </div>
      <ul className="p-2 space-y-1">
        {dia.actividades.map((actividad, index) => (
          <li key={index} className="text-sm text-gray-700 truncate">
            • {actividad.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
};
