import { useState } from 'react';
import { DiaViajeState, ActividadState } from '../types/travel';
import ActivityForm from './ActivityForm';
import Button from './Button';
import ActivityItem from './ActivityItem';

interface DayFormProps {
  day: DiaViajeState;
  onUpdate: (updatedDay: DiaViajeState) => void;
  onRemove: () => void;
}

const DayForm = ({ day, onUpdate, onRemove }: DayFormProps) => {
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddActivity = (activity: ActividadState) => {
    const updatedDay: DiaViajeState = {
      ...day,
      actividades: [...day.actividades, activity]
    };
    onUpdate(updatedDay);
    setShowActivityForm(false);
  };

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = [...day.actividades];
    updatedActivities.splice(index, 1);
    
    const updatedDay: DiaViajeState = {
      ...day,
      actividades: updatedActivities
    };
    onUpdate(updatedDay);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between items-center">
        <button 
          onClick={toggleExpanded}
          className="flex items-center space-x-2 text-left focus:outline-none"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Colapsar día" : "Expandir día"}
        >
          <h3 className="text-xl font-semibold text-gray-800">Día {day.posicion_dia}</h3>
          <span className="text-gray-500 text-sm">
            ({day.actividades.length} {day.actividades.length === 1 ? 'actividad' : 'actividades'})
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRemove}
          className="text-red-500 border-red-500 hover:bg-red-50"
        >
          Eliminar día
        </Button>
      </div>

      {isExpanded && (
        <>
          {day.actividades.length > 0 ? (
            <div className="mb-4 mt-4">
              <ul className="divide-y divide-gray-200">
                {day.actividades.map((actividad, index) => (
                  <li key={index} className="py-4 flex justify-between items-start">
                    <ActivityItem actividad={actividad} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveActivity(index)}
                      className="ml-2 text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 my-4">No hay actividades programadas para este día.</p>
          )}

          {showActivityForm ? (
            <ActivityForm 
              onAddActivity={handleAddActivity}
              onCancel={() => setShowActivityForm(false)}
            />
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowActivityForm(true)}
              className="w-full"
            >
              Agregar actividad
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default DayForm; 