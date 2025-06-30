import { useState } from "react";
import { ViajeState, DiaViajeState } from "../types/travel";

export const useManualPlan = () => {
  const [destino, setDestino] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [dias, setDias] = useState<DiaViajeState[]>([
    { posicion_dia: 1, actividades: [] },
  ]);

  const handleAddDay = () => {
    const newDay: DiaViajeState = {
      posicion_dia: dias.length + 1,
      actividades: [],
    };
    setDias([...dias, newDay]);
  };
  const handleRemoveDay = (index: number) => {
    if (dias.length <= 1) {
      return; // Keep at least one day
    }
    const updatedDias = [...dias];
    updatedDias.splice(index, 1);
    // Reorder days
    const reorderedDias = updatedDias.map((dia, idx) => ({
      ...dia,
      posicion_dia: idx + 1,
    }));
    setDias(reorderedDias);
  };
  const handleUpdateDay = (index: number, updatedDay: DiaViajeState) => {
    const updatedDias = [...dias];
    updatedDias[index] = updatedDay;
    setDias(updatedDias);
  };
  const handlePreview = () => setShowPreview(true);
  const handleEdit = () => setShowPreview(false);

  const getPlan = (): ViajeState => {
    return {
      destino,
      cantidad_dias: dias.length,
      dias_viaje: dias,
    };
  };
  const isValid =
    destino.trim() !== "" && dias.every((dia) => dia.actividades.length > 0);
  const totalActivities = dias.reduce(
    (total, dia) => total + dia.actividades.length,
    0
  );

  return {
    destino,
    setDestino,
    showPreview,
    dias,
    handleAddDay,
    handleRemoveDay,
    handleUpdateDay,
    handlePreview,
    handleEdit,
    getPlan,
    isValid,
    totalActivities,
  };
};
