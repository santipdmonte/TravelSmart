import { ActividadState } from "../types/travel";
import { FaPlane, FaTrain, FaBus, FaCar, FaShip } from "react-icons/fa";

const iconMap: { [key: string]: JSX.Element } = {
  Avión: <FaPlane />,
  Tren: <FaTrain />,
  Bus: <FaBus />,
  Auto: <FaCar />,
  Barco: <FaShip />,
};

interface ActivityItemProps {
  actividad: ActividadState;
}

const ActivityItem = ({ actividad }: ActivityItemProps) => {
  return (
    <div>
      <h4 className="font-semibold text-travel-text-dark">
        {actividad.nombre}
      </h4>
      <p className="text-sm text-travel-text mt-1">{actividad.descripcion}</p>

      {actividad.transporte && (
        <div className="mt-2 bg-travel-secondary-light p-2 rounded-md">
          <p className="text-sm text-travel-primary font-medium">
            Transporte: {actividad.transporte.tipo} desde{" "}
            {actividad.transporte.origen} a {actividad.transporte.destino}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityItem;
