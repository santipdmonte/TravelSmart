import {
  Itinerary,
  ItineraryDestination,
  Day,
  Activity,
} from "../types/travel";

// Esta función convierte la respuesta del agente (con claves en español)
// al formato 'Itinerary' que usan tus componentes de React.
export const transformAgentResponseToItinerary = (
  agentData: any,
  originalItinerary: Itinerary
): Itinerary => {
  if (!agentData || !agentData.destinos) {
    // Si no hay datos válidos, devolvemos el original para no romper la UI
    return originalItinerary;
  }

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
          date: null, // La fecha no la manejamos por ahora
          activities: transformedActivities,
        };
      });

      return {
        destination_name: dest.nombre_destino,
        country_name: originalItinerary.trip_name, // Usamos el nombre del viaje como país
        days_in_destination: dest.cantidad_dias_en_destino,
        destination_order: index + 1,
        days: transformedDays,
      };
    });

  // Devolvemos un nuevo objeto Itinerary completo, manteniendo los datos originales
  // que no cambian y actualizando los que sí.
  return {
    ...originalItinerary,
    trip_name: agentData.nombre_viaje || originalItinerary.trip_name,
    details_itinerary: agentData, // Guardamos el JSON crudo
    destinations: transformedDestinations,
  };
};
