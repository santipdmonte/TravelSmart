import { ViajeState, ViajeStateInput } from '../types/travel';

// This is a mock service to simulate the API during development
export const createTravelPlanMock = async (input: ViajeStateInput): Promise<ViajeState> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sample data based on travel_itinerary.txt
  return {
    destino: input.destino,
    cantidad_dias: input.cantidad_dias,
    dias_viaje: [
      {
        posicion_dia: 1,
        actividades: [
          {
            nombre: 'Llegada a Roma',
            descripcion: 'Llegada al Aeropuerto de Fiumicino y traslado al hotel en el centro de Roma. Check-in y descanso.',
            transporte: null
          },
          {
            nombre: 'Paseo por el centro histórico',
            descripcion: 'Recorrido a pie por la Plaza Navona, el Panteón y la Fontana di Trevi. Cena en un restaurante local.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 2,
        actividades: [
          {
            nombre: 'Visita al Coliseo y Foro Romano',
            descripcion: 'Tour guiado por el Coliseo y el Foro Romano, explorando la historia de la antigua Roma.',
            transporte: null
          },
          {
            nombre: 'Visita al Palatino',
            descripcion: 'Exploración de la colina Palatina, donde se dice que se fundó Roma.',
            transporte: null
          },
          {
            nombre: 'Cena en Trastevere',
            descripcion: 'Cena en el encantador barrio de Trastevere, conocido por su ambiente bohemio.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 3,
        actividades: [
          {
            nombre: 'Visita al Vaticano',
            descripcion: 'Tour por la Ciudad del Vaticano, incluyendo la Basílica de San Pedro y los Museos Vaticanos.',
            transporte: null
          },
          {
            nombre: "Paseo por el Castillo de Sant'Angelo",
            descripcion: "Visita al Castillo de Sant'Angelo y paseo por el río Tíber.",
            transporte: null
          },
          {
            nombre: 'Cena en el barrio de Prati',
            descripcion: 'Cena en un restaurante típico del barrio de Prati, cerca del Vaticano.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 4,
        actividades: [
          {
            nombre: 'Viaje a Florencia',
            descripcion: 'Traslado en tren a Florencia (1.5 horas). Check-in en el hotel.',
            transporte: {
              origen: 'Roma',
              destino: 'Florencia',
              tipo: 'tren'
            }
          },
          {
            nombre: 'Visita a la Galería Uffizi',
            descripcion: 'Exploración de la Galería Uffizi, hogar de obras maestras del Renacimiento.',
            transporte: null
          },
          {
            nombre: 'Paseo por el Ponte Vecchio',
            descripcion: 'Paseo por el famoso puente y cena en un restaurante con vista al río Arno.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 5,
        actividades: [
          {
            nombre: 'Visita a la Catedral de Florencia',
            descripcion: 'Visita a la Catedral de Santa María del Fiore y subida a la cúpula.',
            transporte: null
          },
          {
            nombre: 'Exploración de la Plaza de la Señoría',
            descripcion: 'Paseo por la Plaza de la Señoría y visita a la estatua de David (réplica).',
            transporte: null
          },
          {
            nombre: 'Cena en una trattoria local',
            descripcion: 'Cena en una trattoria típica, probando la famosa pasta toscana.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 6,
        actividades: [
          {
            nombre: 'Viaje a Venecia',
            descripcion: 'Traslado en tren a Venecia (2 horas). Check-in en el hotel.',
            transporte: {
              origen: 'Florencia',
              destino: 'Venecia',
              tipo: 'tren'
            }
          },
          {
            nombre: 'Paseo en góndola',
            descripcion: 'Disfrutar de un paseo en góndola por los canales de Venecia.',
            transporte: null
          },
          {
            nombre: 'Cena en la Plaza de San Marcos',
            descripcion: 'Cena en un restaurante con vista a la Plaza de San Marcos.',
            transporte: null
          }
        ]
      },
      {
        posicion_dia: 7,
        actividades: [
          {
            nombre: 'Visita a la Plaza de San Marcos',
            descripcion: 'Exploración de la Plaza de San Marcos y la Basílica de San Marcos.',
            transporte: null
          },
          {
            nombre: 'Visita al Palacio Ducal',
            descripcion: 'Tour por el Palacio Ducal, aprendiendo sobre la historia de Venecia.',
            transporte: null
          },
          {
            nombre: 'Regreso a casa',
            descripcion: 'Traslado al Aeropuerto de Venecia para el vuelo de regreso.',
            transporte: {
              origen: 'Venecia',
              destino: 'Aeropuerto',
              tipo: 'transporte privado'
            }
          }
        ]
      }
    ]
  };
}; 