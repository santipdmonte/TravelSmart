import { useState } from "react";
import { DiaViajeState, ActividadState } from "../types/travel";
import ActivityForm from "./ActivityForm";
import Button from "./Button";
import ActivityItem from "./ActivityItem";

interface DayFormProps {
  day: DiaViajeState;
  onUpdate: (updatedDay: DiaViajeState) => void;
  onRemove: () => void;
}

const DayForm = ({ day, onUpdate, onRemove }: DayFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState<
    number | null
  >(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddActivity = (activity: ActividadState) => {
    const updatedDay: DiaViajeState = {
      ...day,
      actividades: [...day.actividades, activity],
    };
    onUpdate(updatedDay);
    setShowAddForm(false);
  };

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = [...day.actividades];
    updatedActivities.splice(index, 1);

    const updatedDay: DiaViajeState = {
      ...day,
      actividades: updatedActivities,
    };
    onUpdate(updatedDay);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleUpdateActivity = (updatedActivity: ActividadState) => {
    if (editingActivityIndex === null) return; // Chequeo de seguridad

    const updatedActivities = day.actividades.map((activity, index) =>
      index === editingActivityIndex ? updatedActivity : activity
    );
    onUpdate({ ...day, actividades: updatedActivities });
    setEditingActivityIndex(null); // Salimos del modo edición
  };

  return (
    <div className="border rounded-md bg-white shadow-sm">
      {/* 3. HEADER RESTAURADO: Ahora es un botón para controlar el acordeón */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-3 text-left focus:outline-none w-full"
          aria-expanded={isExpanded}
        >
          <h3 className="text-xl font-semibold text-gray-800">
            Día {day.posicion_dia}
          </h3>
          <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {day.actividades.length}{" "}
            {day.actividades.length === 1 ? "actividad" : "actividades"}
          </span>
          {/* Icono de flecha que rota */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform transition-transform text-gray-500 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:bg-red-50 ml-4"
        >
          Eliminar día
        </Button>
      </div>

      {/* 4. CONTENIDO COLAPSABLE: Todo el contenido del día ahora depende de 'isExpanded' */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            {day.actividades.length > 0 ? (
              day.actividades.map((actividad, index) => (
                <div key={actividad.id}>
                  {editingActivityIndex === index ? (
                    <ActivityForm
                      initialData={actividad}
                      onSave={handleUpdateActivity}
                      onCancel={() => setEditingActivityIndex(null)}
                    />
                  ) : (
                    <ActivityItem
                      actividad={actividad}
                      onEdit={() => setEditingActivityIndex(index)}
                      onRemove={() => handleRemoveActivity(index)}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-2">
                No hay actividades para este día. ¡Añade una!
              </p>
            )}
          </div>

          {showAddForm ? (
            <div className="mt-4">
              <ActivityForm
                onSave={handleAddActivity}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          ) : (
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                + Agregar Actividad
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayForm;
