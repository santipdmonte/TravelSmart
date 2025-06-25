// frontend/src/pages/AIPlanPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItineraryContext } from "../context/ItineraryContext";
import TravelPlanForm from "../components/TravelPlanForm";
import TravelPlanDisplay from "../components/TravelPlanDisplay";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { Itinerary } from "../types/travel";
import {
  initializeAgent,
  sendUserResponse,
  applyAgentChanges,
  generateItinerary,
  sendHILResponse,
} from "../services/travelService";
import { transformAgentResponseToItinerary } from "../utils/transformers.ts";

// Definimos un tipo para los mensajes del chat
interface Message {
  author: "ai" | "user";
  content: string;
}

const AIPlanPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItinerary, setPreviewItinerary] = useState<Itinerary | null>(
    null
  );
  const [isInHILMode, setIsInHILMode] = useState(false);

  const { dispatch } = useItineraryContext();
  const navigate = useNavigate();

  // Estados para el chat de edición
  const [isEditing, setIsEditing] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  const handleGeneratePreview = async (data: {
    trip_name: string;
    days: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newItinerary = await generateItinerary(data);
      setPreviewItinerary(newItinerary);
    } catch (err) {
      setError("Error al crear el plan de viaje.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = async () => {
    if (!previewItinerary) return;
    setIsLoading(true);
    try {
      const initialResponse = await initializeAgent(previewItinerary);
      setThreadId(String(previewItinerary.id));
      setMessages([
        {
          author: "ai",
          content:
            initialResponse.chatbot_response ||
            "Hola, ¿cómo quieres modificar tu viaje?",
        },
      ]);
      setIsEditing(true);
    } catch (error) {
      alert("Error al iniciar el asistente de IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !threadId || isLoading || !previewItinerary)
      return;

    const currentInput = userInput;
    const newUserMessage: Message = { author: "user", content: currentInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      let aiResponse;
      if (isInHILMode) {
        aiResponse = await sendHILResponse(threadId, currentInput);
      } else {
        aiResponse = await sendUserResponse(threadId, currentInput);
      }

      const newAiMessage: Message = {
        author: "ai",
        content: aiResponse.chatbot_response || "No he entendido bien.",
      };
      setMessages((prev) => [...prev, newAiMessage]);

      setIsInHILMode(aiResponse.mode === "hil");

      if (aiResponse.itinerary_preview) {
        // Usamos nuestra función transformadora para actualizar el estado
        const updatedPreview = transformAgentResponseToItinerary(
          aiResponse.itinerary_preview,
          previewItinerary
        );
        setPreviewItinerary(updatedPreview);
      }
    } catch (error) {
      console.error("Error en handleSendMessage:", error);
      setMessages((prev) => [
        ...prev,
        {
          author: "ai",
          content: "Lo siento, ha ocurrido un error al procesar tu respuesta.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Esta es la función final que guarda todo en la DB
  const handleConfirmAndContinue = () => {
    if (!previewItinerary) {
      alert("No hay un itinerario para confirmar.");
      return;
    }

    setIsLoading(true);
    // Usamos el servicio que llama a la vista /modify/ de Django
    // para persistir la versión final del 'previewItinerary'
    applyAgentChanges(previewItinerary)
      .then((finalItinerary) => {
        // Guardamos el resultado final en el contexto global
        dispatch({ type: "SET_ITINERARY", payload: finalItinerary });
        // Y navegamos a la página final del itinerario
        navigate("/itinerary");
      })
      .catch((err) => {
        alert("Hubo un error al guardar la versión final del itinerario.");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24">
        <div className="max-w-4xl mx-auto p-4">
          {!previewItinerary ? (
            // --- VISTA INICIAL DEL FORMULARIO ---
            <div>
              <h1 className="text-3xl font-bold mb-4">Plan de viaje con IA</h1>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <TravelPlanForm
                  onSubmit={handleGeneratePreview}
                  isLoading={isLoading}
                />
                {error && <p className="text-red-500 mt-4">{error}</p>}
              </div>
            </div>
          ) : (
            // --- VISTA DE PREVISUALIZACIÓN Y EDICIÓN ---
            <div>
              <h1 className="text-3xl font-bold mb-4">Vista Previa del Plan</h1>
              <TravelPlanDisplay plan={previewItinerary} />

              <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">
                  Editar con Asistente de IA
                </h2>
                {!isEditing ? (
                  <Button onClick={handleStartEditing} disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Empezar a Editar"}
                  </Button>
                ) : (
                  <div className="flex flex-col h-[32rem]">
                    <div className="flex-grow border rounded-t-lg p-4 overflow-y-auto bg-gray-50 space-y-4">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex items-end gap-2 ${
                            msg.author === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-lg p-3 rounded-lg ${
                              msg.author === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <p className="text-center text-gray-500 animate-pulse">
                          Asistente está escribiendo...
                        </p>
                      )}
                    </div>
                    <form
                      onSubmit={handleSendMessage}
                      className="flex border-t-0 border rounded-b-lg p-2 bg-white"
                    >
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="flex-grow border-none focus:ring-0"
                        placeholder="Ej: Cambia el día 2 a Toledo..."
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                      >
                        Enviar
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  variant="primary"
                  onClick={handleConfirmAndContinue}
                  disabled={isLoading}
                >
                  Confirmar y Guardar Itinerario
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPreviewItinerary(null);
                    setIsEditing(false);
                  }}
                  disabled={isLoading}
                >
                  Generar de Nuevo
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIPlanPage;
