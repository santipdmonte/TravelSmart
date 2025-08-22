'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatPanel } from '@/components/chat';
import { FloatingEditButton, Button } from '@/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ItineraryDetailsPage() {
  const params = useParams();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { clearChat } = useChatActions();

  const itineraryId = params.id as string;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando tu itinerario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Button asChild className="bg-sky-500 hover:bg-sky-700 rounded-full">
              <Link href="/itineraries">
                Volver a itinerarios
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Itinerario no encontrado</h2>
            <p className="text-gray-700 mb-6">El itinerario que buscas no existe.</p>
            <Button asChild className="bg-sky-500 hover:bg-sky-700 rounded-full">
              <Link href="/itineraries">
                Volver a itinerarios
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { details_itinerary } = currentItinerary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isChatOpen ? 'lg:mr-[33.333333%]' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/itineraries"
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              ← Volver a itinerarios
            </Link>
          </div>

          {/* Itinerary Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {details_itinerary.nombre_viaje}
                </h1>
                <p className="text-gray-700 mb-4">
                  {details_itinerary.destino_general} • {details_itinerary.cantidad_dias} días
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>Estado: {currentItinerary.status}</span>
                  <span>•</span>
                  <span>Creado: {new Date(currentItinerary.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Confirm button mockup */}
              <div className="flex items-start md:items-center">
                <Button
                  className="rounded-full bg-sky-500 hover:bg-sky-700 px-6 shadow-md"
                  disabled={currentItinerary.status !== 'draft'}
                >
                  {currentItinerary.status === 'draft' ? 'Confirmar itinerario' : 'Itinerario confirmado'}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs mockup */}
          <div>
            <Tabs defaultValue="itinerary">
              <TabsList className="bg-white border border-gray-200 rounded-full shadow-sm p-1 mb-2">
                <TabsTrigger value="itinerary" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                  Itinerario
                </TabsTrigger>
                <TabsTrigger value="transport" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                  Transporte
                </TabsTrigger>
                <TabsTrigger value="stays" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                  Alojamientos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary">
                {/* Destinations */}
                <div className="space-y-8">
                  {details_itinerary.destinos.map((destination, destIndex) => (
                    <div key={destIndex} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {destination.nombre_destino}
                      </h2>
                      <p className="text-gray-700 mb-6">
                        {destination.cantidad_dias_en_destino} días en este destino
                      </p>

                      {/* Days */}
                      <div className="space-y-4">
                        {destination.dias_destino.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="border-l-4 border-sky-200 pl-6 py-4"
                          >
                            <div className="flex items-center mb-2">
                              <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3 shadow">
                                {day.posicion_dia}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Día {day.posicion_dia}
                              </h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed ml-11">
                              {day.actividades}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transport">
                {details_itinerary.destinos.length > 1 ? (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    {details_itinerary.destinos.map((dest, idx) => (
                      <div key={`transport-${idx}`} className="border-l-4 border-sky-200 pl-6 py-3">
                        <div className="flex items-center mb-2">
                          <div className="bg-sky-500 text-white rounded-full w-3 h-3 flex items-center justify-center mr-3 shadow"></div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {dest.nombre_destino}
                          </h2>
                        </div>
                        {idx < details_itinerary.destinos.length - 1 && (
                          <div className="ml-6 text-gray-700">
                            <div className="font-medium text-gray-900">Avión • 1 h 20 min • US$ 120</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-gray-600">
                    <p>Agrega más de un destino para ver las conexiones de transporte.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stays">
                <div className="space-y-6">
                  {details_itinerary.destinos.map((dest, idx) => (
                    <div key={`stay-${idx}`} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{dest.nombre_destino}</h2>
                      <p className="text-gray-700 mb-4">Encuentra hospedaje para tu estadía.</p>

                      <div className="flex items-center gap-3">
                        <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-700 px-6 shadow-md">
                          <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer">
                            Buscar alojamiento
                          </a>
                        </Button>

                        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                          <span>También en:</span>
                          <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">Airbnb</a>
                          <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">Booking</a>
                          <a href="https://www.expedia.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">Expedia</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>

      {/* Floating Edit Button */}
      <FloatingEditButton itineraryId={itineraryId} />

      {/* Chat Panel - Fixed positioned */}
      <ChatPanel />
    </div>
  );
} 