// frontend/src/components/TravelPlanDisplay.tsx

import { Itinerary } from "../types/travel";

interface TravelPlanDisplayProps {
  plan: Itinerary | null;
}

const TravelPlanDisplay = ({ plan }: TravelPlanDisplayProps) => {
  // Si no hay plan, no mostramos nada. Es una guarda de seguridad.
  if (!plan) {
    return null;
  }

  // Imprimimos en la consola los datos que recibe el componente para depurar.
  // Puedes revisar esto en las herramientas de desarrollador (F12)
  console.log("Datos recibidos por TravelPlanDisplay:", plan);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {plan.trip_name}
        </h2>
        <p className="text-gray-500">ID del Viaje: {plan.id}</p>
      </div>

      {/* Verificamos que plan.destinations exista y sea un array antes de mapearlo */}
      {plan.destinations &&
        plan.destinations.map((destination, destIndex) => (
          <div
            key={destIndex}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="text-xl font-semibold text-blue-700">
              {destination.destination_name}, {destination.country_name}
              <span className="text-base font-normal text-gray-600 ml-2">
                ({destination.days_in_destination} días)
              </span>
            </h3>

            <div className="mt-4 space-y-4">
              {/* Hacemos lo mismo para los días */}
              {destination.days &&
                destination.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="pl-4 border-l-4 border-blue-300"
                  >
                    <h4 className="text-lg font-medium text-gray-800">
                      Día {day.day_number}{" "}
                      <span className="text-sm font-light text-gray-500">
                        ({day.date})
                      </span>
                    </h4>

                    <ul className="mt-2 list-none space-y-2 pl-2">
                      {/* Y para las actividades */}
                      {day.activities &&
                        day.activities.map((activity, activityIndex) => (
                          <li
                            key={activityIndex}
                            className="text-gray-700 bg-white p-2 rounded shadow-sm"
                          >
                            <strong className="font-semibold text-gray-900">
                              {activity.name}:
                            </strong>{" "}
                            {activity.description}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TravelPlanDisplay;
