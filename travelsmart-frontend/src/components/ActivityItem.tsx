import { ActividadState } from '../types/travel';

interface ActivityItemProps {
  actividad: ActividadState;
}

const ActivityItem = ({ actividad }: ActivityItemProps) => {
  return (
    <li className="py-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold text-gray-800">{actividad.nombre}</h4>
        </div>
        
        <p className="text-gray-600">{actividad.descripcion}</p>
        
        {actividad.transporte && (
          <div className="mt-2 bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700 font-medium">
              Transporte: {actividad.transporte.tipo} desde {actividad.transporte.origen} a {actividad.transporte.destino}
            </p>
          </div>
        )}
      </div>
    </li>
  );
};

export default ActivityItem; 