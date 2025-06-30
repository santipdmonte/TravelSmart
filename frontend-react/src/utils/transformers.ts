import {
  Itinerary,
  ItineraryDestination,
  Day,
  Activity,
} from "../types/travel";

export const transformAgentResponseToItinerary = (
  agentData: any,
  originalItinerary: Itinerary
): Itinerary => {
  // Esta validación inicial está bien.
  if (!agentData || !agentData.destinos) {
    return originalItinerary;
  }

  // Esta parte de transformar los destinos y días también está bien.
  const transformedDestinations: ItineraryDestination[] =
    agentData.destinos.map((dest: any, index: number) => {
      const transformedDays: Day[] = dest.dias_destino.map((day: any) => {
        let activityList: any[] = [];
        if (typeof day.actividades === "string") {
          activityList = day.actividades
            .split(".")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (Array.isArray(day.actividades)) {
          activityList = day.actividades;
        }

        const transformedActivities: Activity[] = activityList.map(
          (act: any, actIndex: number) => {
            if (typeof act === "string") {
              return {
                name: act,
                description: "",
                activity_order: actIndex + 1,
                details_activity: {},
              };
            }
            return {
              name: act.nombre || "",
              description: act.descripcion || "",
              activity_order: actIndex + 1,
              details_activity: act.details || {},
            };
          }
        );

        return {
          day_number: day.posicion_dia,
          date: null,
          activities: transformedActivities,
        };
      });

      return {
        destination_name: dest.nombre_destino,
        country_name: agentData.destino_general || originalItinerary.trip_name,
        days_in_destination: dest.cantidad_dias_en_destino,
        destination_order: index + 1,
        days: transformedDays,
      };
    });

  // 👇 --- EL CAMBIO CLAVE ESTÁ AQUÍ --- 👇
  // En lugar de esparcir el objeto antiguo, construimos uno nuevo y limpio.
  const newItinerary: Itinerary = {
    // 1. Conservamos solo los datos de identidad del itinerario original.
    id: originalItinerary.id,
    visibility: originalItinerary.visibility,
    status: originalItinerary.status,
    created_at: originalItinerary.created_at,
    updated_at: new Date().toISOString(), // Actualizamos la fecha de modificación

    // 2. Usamos TODOS los datos nuevos que vienen de la respuesta del agente.
    trip_name: agentData.nombre_viaje || "Itinerario modificado",
    details_itinerary: agentData, // El nuevo JSON crudo
    destinations: transformedDestinations, // La nueva lista de destinos
  };

  return newItinerary;
};
