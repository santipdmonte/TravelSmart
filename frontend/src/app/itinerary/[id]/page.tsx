'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatPanel } from '@/components/chat';
import { FloatingEditButton, Button, Input } from '@/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ItineraryDetailsPage() {
  const params = useParams();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { clearChat } = useChatActions();

  const itineraryId = params.id as string;

  // Mock state for accommodations per destination
  const [accommodationsByDest, setAccommodationsByDest] = useState<string[][]>([]);
  const [newLinkByDest, setNewLinkByDest] = useState<string[]>([]);

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

  // Seed one placeholder link per destination (mock)
  useEffect(() => {
    if (!currentItinerary?.details_itinerary?.destinos) {
      setAccommodationsByDest([]);
      setNewLinkByDest([]);
      return;
    }
    const seeded = currentItinerary.details_itinerary.destinos.map((d) => {
      const q = encodeURIComponent(d.nombre_destino ?? '');
      return [`https://www.booking.com/searchresults.html?ss=${q}`];
    });
    setAccommodationsByDest(seeded);
    setNewLinkByDest(currentItinerary.details_itinerary.destinos.map(() => ''));
  }, [currentItinerary]);

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

  const handleAddLink = (destIndex: number) => {
    const url = (newLinkByDest[destIndex] || '').trim();
    if (!url) return;
    setAccommodationsByDest((prev) => {
      const next = prev.map((arr) => [...arr]);
      if (!next[destIndex]) next[destIndex] = [];
      next[destIndex].push(url);
      return next;
    });
    setNewLinkByDest((prev) => prev.map((v, i) => (i === destIndex ? '' : v)));
  };

  const handleDeleteLink = (destIndex: number, linkIndex: number) => {
    setAccommodationsByDest((prev) => {
      const next = prev.map((arr) => [...arr]);
      if (next[destIndex]) {
        next[destIndex].splice(linkIndex, 1);
      }
      return next;
    });
  };

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
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-bold text-gray-900">{dest.nombre_destino}</h2>
                          <p className="text-gray-700 ml-1">• dd/mm/aaaa - dd/mm/aaaa (dd días)</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href="https://www.airbnb.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors"
                            style={{ backgroundColor: '#FF5A5F' }}
                          >
                            <img
                              src="/accommodations-ico/airbnb.avif"
                              alt="Airbnb"
                              className="h-5 w-5 rounded-sm"
                            />
                            Airbnb
                          </a>

                          <a
                            href="https://www.booking.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors bg-[#003580] hover:bg-[#00224F]"
                          >
                            <img
                              src="/accommodations-ico/booking.svg"
                              alt="Booking.com"
                              className="h-5 w-5"
                            />
                            Booking
                          </a>

                          <a
                            href="https://www.expedia.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors bg-[#1F2B6C] hover:bg-[#172059]"
                          >
                            <img
                              src="/accommodations-ico/expedia.ico"
                              alt="Expedia"
                              className="h-5 w-5"
                            />
                            Expedia
                          </a>
                        </div>
                      </div>

                      {/* Saved accommodations (mock) */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 max-w-md">
                          <Input
                            placeholder="Pega un enlace de Airbnb, Booking o Expedia"
                            value={newLinkByDest[idx] ?? ''}
                            onChange={(e) =>
                              setNewLinkByDest((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                            }
                            className="rounded-full"
                          />
                          <Button
                            className="rounded-full bg-sky-500 hover:bg-sky-700 px-5"
                            onClick={() => handleAddLink(idx)}
                          >
                            + Agregar
                          </Button>
                        </div>

                        <ul className="mt-4 space-y-2">
                          {(accommodationsByDest[idx] ?? []).map((link, linkIdx) => (
                            <li key={`${idx}-${linkIdx}`} className="flex items-center justify-between gap-3 border border-gray-100 rounded-full px-4 py-2">
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-700 hover:text-sky-800 hover:underline truncate"
                              >
                                {link}
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full hover:bg-red-100"
                                onClick={() => handleDeleteLink(idx, linkIdx)}
                                aria-label="Eliminar alojamiento"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m5 0H4"
                                  />
                                </svg>
                              </Button>
                            </li>
                          ))}
                        </ul>
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