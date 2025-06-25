import apiClient from "./apiClient";
import { Itinerary } from "../types/travel"; // Importamos nuestro nuevo tipo de dato para el itinerario

// Definimos la estructura del objeto que enviaremos al backend
interface GeneratePayload {
  trip_name: string;
  days: number;
}

/**
 * Llama al endpoint del backend para generar un nuevo itinerario.
 * @param payload - Un objeto que contiene trip_name y days.
 * @returns Una promesa que se resuelve con el objeto del itinerario completo.
 */
export const generateItinerary = async (
  payload: GeneratePayload
): Promise<Itinerary> => {
  try {
    console.log(
      "Enviando petición al backend para generar itinerario:",
      payload
    );

    // Hacemos la llamada POST a nuestro endpoint de Django usando el cliente de axios
    const response = await apiClient.post<Itinerary>(
      "/itineraries/generate/",
      payload
    );

    console.log("Backend respondió con el itinerario:", response.data);

    // Devolvemos los datos del itinerario creado que vienen en la respuesta
    return response.data;
  } catch (error) {
    console.error("Error generando el itinerario desde el servicio:", error);
    // En un futuro, aquí podrías manejar los errores de forma más elegante
    // para mostrarle un mensaje específico al usuario.
    throw error;
  }
};
