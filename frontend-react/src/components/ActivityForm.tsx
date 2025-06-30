import { useEffect, useState } from "react";
import { ActividadState, TransporteState } from "../types/travel";
import Button from "./Button";

interface ActivityFormProps {
  onSave: (activity: ActividadState) => void;
  onCancel: () => void;
  initialData?: ActividadState;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const isEditing = !!initialData;

  // Unificar el estado en un solo objeto
  const [activity, setActivity] = useState<Omit<ActividadState, "id">>({
    nombre: "",
    descripcion: "",
    transporte: null,
  });

  // Este efecto carga los datos iniciales cuando entramos en modo edición
  useEffect(() => {
    if (initialData) {
      setActivity({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion,
        transporte: initialData.transporte,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setActivity((prev) => ({
        ...prev,
        transporte: checked ? { origen: "", destino: "", tipo: "" } : null,
      }));
    } else {
      setActivity((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleTransportChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setActivity((prev) => ({
      ...prev,
      transporte: prev.transporte
        ? { ...prev.transporte, [id]: value }
        : prev.transporte,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activityToSave: ActividadState = {
      ...activity,
      id: initialData?.id || Date.now().toString(), // <-- LÍNEA CLAVE
    };
    onSave(activityToSave);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-blue-50 p-4 rounded-md border"
    >
      <h4 className="font-semibold text-lg">
        {isEditing ? "Editar Actividad" : "Nueva Actividad"}
      </h4>

      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre de la actividad
        </label>
        <input
          id="nombre"
          type="text"
          value={activity.nombre}
          onChange={handleChange}
          required
          className="w-full ..."
        />
      </div>
      <div>
        <label
          htmlFor="descripcion"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={activity.descripcion}
          onChange={handleChange}
          required
          rows={3}
          className="w-full ..."
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeTransporte"
          checked={!!activity.transporte}
          onChange={handleChange}
          className="h-4 w-4 ..."
        />
        <label
          htmlFor="includeTransporte"
          className="ml-2 block text-sm text-gray-700"
        >
          Incluir transporte
        </label>
      </div>

      {activity.transporte && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div>
            <label
              htmlFor="origen"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Origen
            </label>
            <input
              id="origen"
              type="text"
              value={activity.transporte.origen}
              onChange={handleTransportChange}
              required={!!activity.transporte}
              className="w-full ..."
            />
          </div>
          <div>
            <label
              htmlFor="destino"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Destino
            </label>
            <input
              id="destino"
              type="text"
              value={activity.transporte.destino}
              onChange={handleTransportChange}
              required={!!activity.transporte}
              className="w-full ..."
            />
          </div>
          <div>
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de transporte
            </label>
            <select
              id="tipo"
              value={activity.transporte.tipo}
              onChange={handleTransportChange}
              required={!!activity.transporte}
              className="w-full ..."
            >
              <option value="">Selecciona un tipo</option>
              <option value="Avión">Avión</option>
              <option value="Tren">Tren</option>
              <option value="Bus">Bus</option>
              <option value="Auto">Auto</option>
              <option value="Barco">Barco</option>
              <option value="Transporte público">Transporte público</option>
              <option value="A pie">A pie</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button onClick={onCancel} variant="outline" type="button">
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
