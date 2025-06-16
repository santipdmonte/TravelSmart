import { ViajeState } from "../types/travel";
import TravelDayCard, { TravelDayCardCompact } from "./TravelDayCard";

interface TravelPlanDisplayProps {
  plan: ViajeState;
  compact?: boolean;
}

const TravelPlanDisplay = ({
  plan,
  compact = false,
}: TravelPlanDisplayProps) => {
  return (
    <div className="w-full">
      <div className="bg-travel-primary text-white p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold">Plan de viaje: {plan.destino}</h2>
        <p className="text-blue-200">Duración: {plan.cantidad_dias} días</p>
      </div>
      <div
        className={
          compact
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-travel-surface rounded-b-lg shadow-lg"
            : "space-y-6 mt-6"
        }
      >
        {plan.dias_viaje.map((dia) =>
          compact ? (
            <TravelDayCardCompact key={dia.posicion_dia} dia={dia} />
          ) : (
            <TravelDayCard key={dia.posicion_dia} dia={dia} />
          )
        )}
      </div>
    </div>
  );
};

export default TravelPlanDisplay;
