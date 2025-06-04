// Simulación de API para traslados
export async function getTransportations(destino: string) {
  // Simulación: datos hardcodeados del ejemplo travel_transportation.txt
  return [
    {
      origen: 'Aeropuerto de Fiumicino',
      destino: 'Roma',
      tipo: 'transporte privado',
      dia: 1,
      descripcion: 'Llegada a Roma desde el aeropuerto y traslado al hotel.'
    },
    {
      origen: 'Roma',
      destino: 'Florencia',
      tipo: 'tren',
      dia: 4,
      descripcion: 'Traslado en tren de Roma a Florencia (1.5 horas).'
    },
    {
      origen: 'Florencia',
      destino: 'Venecia',
      tipo: 'tren',
      dia: 6,
      descripcion: 'Traslado en tren de Florencia a Venecia (2 horas).'
    },
    {
      origen: 'Venecia',
      destino: 'Aeropuerto de Venecia',
      tipo: 'transporte privado',
      dia: 7,
      descripcion: 'Traslado al aeropuerto para el vuelo de regreso.'
    }
  ];
}
