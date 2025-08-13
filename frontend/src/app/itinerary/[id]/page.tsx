"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatPanel } from "@/components/chat";
import { FloatingEditButton, Button, AIChangePreview } from "@/components";
import type {
  ItineraryDiffResponse,
  DayActividadItem,
} from "@/types/itinerary";

export default function ItineraryDetailsPage() {
  const params = useParams();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { clearChat } = useChatActions();

  const itineraryId = params.id as string;
  const [diffData, setDiffData] = useState<ItineraryDiffResponse | null>(null);

  useEffect(() => {
    if (itineraryId) {
      fetchItinerary(itineraryId);
    }
  }, [itineraryId, fetchItinerary]);

  // Close chat if it's open for a different itinerary
  useEffect(() => {
    if (isChatOpen && threadId && threadId !== itineraryId) {
      clearChat();
    }
  }, [itineraryId, isChatOpen, threadId, clearChat]);

  // Cleanup: Clear chat state when leaving the page
  useEffect(() => {
    return () => {
      if (isChatOpen) {
        clearChat();
      }
    };
  }, [isChatOpen, clearChat]);

  // For now, just log when a proposal arrives
  const handleProposalReceived = (data: ItineraryDiffResponse) => {
    console.log("Parent received proposal diff:", data);
    setDiffData(data);
  };

  // Log whenever diffData changes (temporary for wiring validation)
  useEffect(() => {
    if (diffData) {
      console.log("diffData updated in parent:", diffData);
    }
  }, [diffData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/itineraries">Back to Itineraries</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Itinerary Not Found
            </h2>
            <p className="text-gray-700 mb-6">
              The itinerary you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/itineraries">Back to Itineraries</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { details_itinerary } = currentItinerary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isChatOpen ? "lg:mr-[33.333333%]" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/itineraries"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Itineraries
            </Link>
          </div>

          {/* Itinerary Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {details_itinerary.nombre_viaje}
                </h1>
                <p className="text-gray-700 mb-4">
                  {details_itinerary.destino_general} •{" "}
                  {details_itinerary.cantidad_dias} days
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>Status: {currentItinerary.status}</span>
                  <span>•</span>
                  <span>
                    Created:{" "}
                    {new Date(currentItinerary.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-8">
            {details_itinerary.destinos.map((destination, destIndex) => (
              <div
                key={destIndex}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {destination.nombre_destino}
                </h2>
                <p className="text-gray-700 mb-6">
                  {destination.cantidad_dias_en_destino} days in this
                  destination
                </p>

                {/* Days */}
                <div className="space-y-4">
                  {destination.dias_destino.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-l-4 border-indigo-200 pl-6 py-4"
                    >
                      <div className="flex items-center mb-2">
                        <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3">
                          {day.posicion_dia}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Day {day.posicion_dia}
                        </h3>
                      </div>
                      <div className="text-gray-700 leading-relaxed ml-11">
                        {Array.isArray(day.actividades) ? (
                          day.actividades.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {day.actividades.map(
                                (actividad: DayActividadItem, idx: number) => (
                                  <li key={idx}>
                                    <span className="font-medium">
                                      {actividad.nombre}:
                                    </span>{" "}
                                    {actividad.descripcion}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="italic text-gray-500">
                              No activities for this day.
                            </p>
                          )
                        ) : (
                          <p>{day.actividades}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Change Preview (from chat) */}
          {diffData && (
            <div className="mt-8">
              <AIChangePreview
                itineraryId={itineraryId}
                initialDiff={diffData}
                onClear={() => setDiffData(null)}
              />
            </div>
          )}

          {/* Other Actions */}
          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Link href="/create">Create Another Itinerary</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Edit Button */}
      <FloatingEditButton itineraryId={itineraryId} />

      {/* Chat Panel - Fixed positioned */}
      <ChatPanel onProposalReceived={handleProposalReceived} />
    </div>
  );
}
