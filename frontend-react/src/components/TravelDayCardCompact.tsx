import { DiaViajeState } from "../types/travel";

interface TravelDayCardCompactProps {
  dia: DiaViajeState;
}

const TravelDayCardCompact = ({ dia }: TravelDayCardCompactProps) => {
  return (
    <div className="bg-travel-secondary-light p-4 rounded-lg border border-travel-secondary">
      <h3 className="font-bold text-travel-text-dark">
        Día {dia.posicion_dia}
        <span className="ml-2 text-sm font-normal text-travel-text">
          ({dia.actividades.length} actividades)
        </span>
      </h3>
      <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-travel-text">
        {dia.actividades.map((actividad, index) => (
          <li key={index}>{actividad.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default TravelDayCardCompact;
