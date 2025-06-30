import { ActividadState } from "../types/travel";
import Button from "./Button";
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
  onEdit: () => void;
  onRemove: () => void;
}

const ActivityItem = ({ actividad, onEdit, onRemove }: ActivityItemProps) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-grow">
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
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:bg-red-50"
        >
          Borrar
        </Button>
      </div>
    </div>
  );
};

export default ActivityItem;
