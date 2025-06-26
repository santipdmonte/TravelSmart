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
      "/itineraries/",
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

// --- NUEVAS FUNCIONES PARA EL AGENTE DE IA ---

/**
 * Llama al backend para inicializar una conversación con el agente de IA.
 */
export const initializeAgent = async (itinerary: Itinerary): Promise<any> => {
  try {
    const response = await apiClient.post(`/itineraries/${itinerary.id}/agents/${itinerary.id}/`);
    return response.data;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw error;
  }
};

/**
 * Envía la respuesta/prompt del usuario al agente de IA.
 */
export const sendUserResponse = async (
  threadId: string,
  userMessage: string
): Promise<any> => {
  try {
    const payload = {
      user_response: userMessage,
    };
    const response = await apiClient.post(`/agents/${threadId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending user response:", error);
    throw error;
  }
};

export const sendHILResponse = async (
  threadId: string,
  userMessage: string
): Promise<any> => {
  try {
    const payload = {
      user_HIL_response: userMessage,
    };
    // Asegúrate de que apunta al endpoint correcto
    const response = await apiClient.post(`/agents/${threadId}/`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending HIL response:", error);
    throw error;
  }
};

/**
 * Llama al endpoint que aplica los cambios del agente en la base de datos.
 */
export const applyAgentChanges = async (itineraryToSave: Itinerary): Promise<Itinerary> => {
  try {
    // Ahora enviamos el objeto del itinerario en el cuerpo de la petición.
    // Usamos el 'details_itinerary' que contiene el JSON crudo que el backend espera.
    const payload = {
        itinerary_final_state: itineraryToSave.details_itinerary
    };
    
    const response = await apiClient.post<Itinerary>(
      `/itineraries/${itineraryToSave.id}/modify/`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error applying agent changes:", error);
    throw error;
  }
};
