// Simulación de API para alojamientos
export async function getAccommodations(destino: string) {
  // Simulación: datos hardcodeados del ejemplo travel_destination.txt
  return [
    {
      ciudad: 'Roma',
      desde_dia: 1,
      hasta_dia: 4,
      noches: 3
    },
    {
      ciudad: 'Florencia',
      desde_dia: 4,
      hasta_dia: 6,
      noches: 2
    },
    {
      ciudad: 'Venecia',
      desde_dia: 6,
      hasta_dia: 7,
      noches: 1
    }
  ];
} 