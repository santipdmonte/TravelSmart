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


function getBookingUrl(destination: string, checkIn: string, checkOut: string, people: number): string {
  const [inYear, inMonth, inDay] = checkIn.split("-");
  const [outYear, outMonth, outDay] = checkOut.split("-");
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}&checkin_year=${inYear}&checkin_month=${inMonth}&checkin_monthday=${inDay}&checkout_year=${outYear}&checkout_month=${outMonth}&checkout_monthday=${outDay}&group_adults=${people}&group_children=0`;
}

function getAirbnbUrl(destination: string, checkIn: string, checkOut: string, people: number): string {
  return `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes?checkin=${checkIn}&checkout=${checkOut}&adults=${people}&children=0`;
}

function getExpediaUrl(destination: string, checkIn: string, checkOut: string, people: number): string {
  return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${checkIn}&endDate=${checkOut}&adults=${people}`;
}

function getHotelsUrl(destination: string, checkIn: string, checkOut: string, people: number): string {
  return `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(destination)}&startDate=${checkIn}&endDate=${checkOut}&adults=${people}`;
}

export function generateHotelLinks(destination: string, checkIn: string, checkOut: string, people: number) {
  return {
    booking: getBookingUrl(destination, checkIn, checkOut, people),
    airbnb: getAirbnbUrl(destination, checkIn, checkOut, people),
    expedia: getExpediaUrl(destination, checkIn, checkOut, people),
    hotels: getHotelsUrl(destination, checkIn, checkOut, people)
  };
}