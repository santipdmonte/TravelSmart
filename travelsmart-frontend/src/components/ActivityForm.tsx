import { useState } from 'react';
import { ActividadState, TransporteState } from '../types/travel';
import Button from './Button';

interface ActivityFormProps {
  onAddActivity: (activity: ActividadState) => void;
  onCancel: () => void;
}

const ActivityForm = ({ onAddActivity, onCancel }: ActivityFormProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [includeTransporte, setIncludeTransporte] = useState(false);
  const [transporte, setTransporte] = useState<TransporteState>({
    origen: '',
    destino: '',
    tipo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newActivity: ActividadState = {
      nombre,
      descripcion,
      transporte: includeTransporte ? transporte : null
    };
    
    onAddActivity(newActivity);
    
    // Reset form
    setNombre('');
    setDescripcion('');
    setIncludeTransporte(false);
    setTransporte({
      origen: '',
      destino: '',
      tipo: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-md">
      <h4 className="font-semibold text-lg">Nueva Actividad</h4>
      
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la actividad
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Visita al museo"
        />
      </div>
      
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          rows={3}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Detalla la actividad..."
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeTransporte"
          checked={includeTransporte}
          onChange={(e) => setIncludeTransporte(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="includeTransporte" className="ml-2 block text-sm text-gray-700">
          Incluir transporte
        </label>
      </div>
      
      {includeTransporte && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div>
            <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-1">
              Origen
            </label>
            <input
              id="origen"
              type="text"
              value={transporte.origen}
              onChange={(e) => setTransporte({...transporte, origen: e.target.value})}
              required={includeTransporte}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lugar de origen"
            />
          </div>
          
          <div>
            <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">
              Destino
            </label>
            <input
              id="destino"
              type="text"
              value={transporte.destino}
              onChange={(e) => setTransporte({...transporte, destino: e.target.value})}
              required={includeTransporte}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lugar de destino"
            />
          </div>
          
          <div>
            <label htmlFor="tipoTransporte" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de transporte
            </label>
            <select
              id="tipoTransporte"
              value={transporte.tipo}
              onChange={(e) => setTransporte({...transporte, tipo: e.target.value})}
              required={includeTransporte}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          Agregar actividad
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm; 