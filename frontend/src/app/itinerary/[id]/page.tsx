'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useItineraryActions } from '@/hooks/useItineraryActions';
import { useChat } from '@/contexts/AgentContext';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatPanel } from '@/components/chat';
import { apiRequest } from '@/lib/api';
import { FloatingEditButton, Button, Input } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarIcon, PlaneIcon, TrainIcon, BusIcon, CarIcon, ShipIcon, CircleHelpIcon } from 'lucide-react';

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
  // Mock state for Route tab (destinations + days)
  type RouteSegment = { name: string; days: number };
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isAddDestOpen, setIsAddDestOpen] = useState<boolean>(false);
  const [newDestName, setNewDestName] = useState<string>('');
  const [newDestDays, setNewDestDays] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<string>('itinerary');
  const [isTripDetailsOpen, setIsTripDetailsOpen] = useState<boolean>(false);
  const [tripStartDate, setTripStartDate] = useState<string>('');
  const [tripTravelersCount, setTripTravelersCount] = useState<number>(1);
  const [savingTripDetails, setSavingTripDetails] = useState<boolean>(false);
  const [accommodationLinks, setAccommodationLinks] = useState<Record<string, { airbnb: string; booking: string; expedia: string }>>({});
  const [loadingAccommodationLinks, setLoadingAccommodationLinks] = useState<boolean>(false);

  // Compute mock map points for the Route tab
  const routePoints = useMemo(() => {
    const count = routeSegments.length;
    if (count < 2) return [] as { x: number; y: number }[];
    return routeSegments.map((_, i) => {
      const x = 60 + (i * (280 / (count - 1)));
      const y = 110 + ((i % 2) * 120);
      return { x, y };
    });
  }, [routeSegments]);

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
      setRouteSegments([]);
      return;
    }
    const seeded = currentItinerary.details_itinerary.destinos.map((d) => {
      const q = encodeURIComponent(d.ciudad ?? '');
      return [`https://www.booking.com/searchresults.html?ss=${q}`];
    });
    setAccommodationsByDest(seeded);
    setNewLinkByDest(currentItinerary.details_itinerary.destinos.map(() => ''));
    // Seed route segments from itinerary
    setRouteSegments(
      currentItinerary.details_itinerary.destinos.map((d) => ({
        name: d.ciudad,
        days: d.dias_en_destino,
      }))
    );
  }, [currentItinerary]);

  // Fetch accommodation links from backend for 'stays' tab
  const fetchAccommodationLinks = useCallback(async () => {
    if (!itineraryId) return;
    if (!currentItinerary?.start_date || !currentItinerary?.travelers_count) return;
    try {
      setLoadingAccommodationLinks(true);
      const res = await apiRequest<Record<string, { airbnb: string; booking: string; expedia: string }>>(
        `/api/itineraries/${itineraryId}/accommodations/links`
      );
      if (res.data) {
        setAccommodationLinks(res.data);
      }
    } finally {
      setLoadingAccommodationLinks(false);
    }
  }, [itineraryId, currentItinerary?.start_date, currentItinerary?.travelers_count]);

  useEffect(() => {
    fetchAccommodationLinks();
  }, [fetchAccommodationLinks]);

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
  const hasMultipleDestinations = details_itinerary.destinos.length > 1;

  // Actions for Route tab (mock)
  const incrementDays = (index: number) =>
    setRouteSegments((prev) => prev.map((s, i) => (i === index ? { ...s, days: s.days + 1 } : s)));
  const decrementDaysOrDelete = (index: number) =>
    setRouteSegments((prev) => {
      const copy = [...prev];
      const seg = copy[index];
      if (!seg) return prev;
      if (seg.days <= 1) {
        copy.splice(index, 1);
        return copy;
      }
      copy[index] = { ...seg, days: seg.days - 1 };
      return copy;
    });
  // Removed unused route reordering/add/remove helpers

  const handleConfirmAddDestination = () => {
    const name = newDestName.trim();
    const daysParsed = Number(newDestDays);
    const days = Number.isFinite(daysParsed) && daysParsed > 0 ? Math.floor(daysParsed) : 1;
    if (!name) return;
    setRouteSegments((prev) => [...prev, { name, days }]);
    setNewDestName('');
    setNewDestDays(2);
    setIsAddDestOpen(false);
  };

  
  // DnD handlers for reordering route segments (native HTML5)
  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const onDrop = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    const fromIndexString = e.dataTransfer.getData('text/plain');
    const fromIndex = parseInt(fromIndexString, 10);
    setDragOverIndex(null);
    if (Number.isNaN(fromIndex) || fromIndex === index) return;
    setRouteSegments((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
  };

  const onDragEnd = () => {
    setDragOverIndex(null);
  };

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

          {/* Itinerary Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8 relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {details_itinerary.nombre_viaje}
                </h1>
                <p className="text-gray-700">
                  {details_itinerary.destino_general} 
                  {currentItinerary.start_date ? ` • ${new Date(currentItinerary.start_date).toLocaleDateString()} (${details_itinerary.cantidad_dias} días)` : 
                  ` • ${details_itinerary.cantidad_dias} días`}
                  {typeof currentItinerary.travelers_count === 'number' && currentItinerary.travelers_count > 0
                    ? ` • ${currentItinerary.travelers_count} viajero${currentItinerary.travelers_count > 1 ? 's' : ''}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="absolute top-6 right-6">
              <Badge className="rounded-full capitalize">{currentItinerary.status}</Badge>
            </div>
          </div>

          {/* Tabs mockup */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between">
                <div>
                  <TabsList className="bg-white border border-gray-200 rounded-full shadow-sm p-1 mb-2">
                    {hasMultipleDestinations && (
                      <TabsTrigger value="route" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                        Ruta
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="itinerary" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                      Actividades
                    </TabsTrigger>
                    <TabsTrigger value="transport" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                      Transporte
                    </TabsTrigger>
                    <TabsTrigger value="stays" className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700">
                      Alojamientos
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex items-center">
                  {activeTab === 'stays' && (
                    <Button
                      className="rounded-full bg-sky-500 hover:bg-sky-700"
                      onClick={() => {
                        setTripStartDate(
                          currentItinerary.start_date
                            ? new Date(currentItinerary.start_date).toISOString().slice(0, 10)
                            : ''
                        );
                        setTripTravelersCount(currentItinerary.travelers_count ?? 1);
                        setIsTripDetailsOpen(true);
                      }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {currentItinerary.start_date ? 'Modificar fecha viaje' : 'Agregar fecha viaje'}
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="itinerary">
                {/* Destinations */}
                <div className="space-y-8">
                  {details_itinerary.destinos.map((destination, destIndex) => (
                    <div key={destIndex} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {destination.ciudad}
                      </h2>
                      <p className="text-gray-700 mb-6">
                        {destination.dias_en_destino} días en este destino
                      </p>

                      {/* Suggested activities */}
                      <div className="space-y-4">
                        <div className="border-l-4 border-sky-200 pl-6 py-4">
                          <div className="flex items-center mb-2">
                            <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3 shadow">
                              i
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Actividades sugeridas
                            </h3>
                          </div>
                          <p className="text-gray-700 leading-relaxed ml-11 whitespace-pre-line">
                            {destination.actividades_sugeridas}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {hasMultipleDestinations && (
                <TabsContent value="route">
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                      {/* Left: Destination steps */}
                      <div className="md:col-span-2 space-y-5">
                        {routeSegments.map((seg, idx) => (
                          <div
                            key={`route-left-${idx}`}
                            className={`flex justify-between gap-2 ${dragOverIndex === idx ? 'bg-sky-50 rounded-xl' : ''}`}
                            onDragOver={(e) => onDragOver(e, idx)}
                            onDragEnter={(e) => onDragOver(e, idx)}
                            onDrop={(e) => onDrop(e, idx)}
                          >
                            
                            <div className="flex items-center gap-2">
                              {/* {idx < routeSegments.length - 1 && (
                                <span className="absolute left-10 top-6 bottom-[-14px] w-px bg-sky-200"></span>
                              )} */}
                              {/* Drag handle to the left */}
                              <div
                                className="text-gray-400 cursor-grab"
                                title="Reordenar"
                                draggable
                                onDragStart={(e) => onDragStart(e, idx)}
                                onDragEnd={onDragEnd}
                              >
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 6h10M5 10h10M5 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                              {/* Step number */}
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-sky-600 border border-sky-400 text-sm font-semibold shadow">
                                {idx + 1}
                              </div>
                              <div className="flex-1 pl-1">
                                <h3 className="text-lg font-semibold text-gray-900">{seg.name}</h3>
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {/* subtract/delete */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => decrementDaysOrDelete(idx)}
                                  aria-label={seg.days <= 1 ? 'Eliminar destino' : 'Restar día'}
                                >
                                  {seg.days <= 1 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                    </svg>
                                  )}
                                </Button>
                                {/* days */}
                                <div>
                                  <div className="text-xl font-semibold w-8 text-center">{seg.days}</div>
                                  <div className="text-gray-500 text-sm">días</div>
                                </div>
                                {/* add */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => incrementDays(idx)}
                                  aria-label="Sumar día"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add new destination row */}
                        <button onClick={() => setIsAddDestOpen(true)} className="flex pl-6 w-full text-left py-3 hover:bg-sky-50 rounded-xl">
                          {/* Plus circle in the step position */}
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-sky-600 border border-sky-400 text-sm font-semibold shadow">
                                +
                            </div>
                            <h3 className="text-sky-700 font-semibold pl-1">Agregar destino</h3>
                          </div>
                        </button>
                      </div>

                      {/* Right: Mock map with route */}
                      <div className="md:col-span-3">
                        <div className="relative w-full h-80 md:h-[420px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                          {/* Simple map-like background */}
                          <div className="absolute inset-0 bg-gradient-to-b from-[#d7f0ff] to-[#eaf7ff]" />
                          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#9bd2f7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                          {/* SVG route mock */}
                          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                            <defs>
                              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9" />
                              </marker>
                            </defs>
                            {routePoints.length >= 2 && (
                              <g>
                                <path d={routePoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')} stroke="#0ea5e9" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
                                {routePoints.map((p, i) => (
                                  <g key={`pt-${i}`}>
                                    <circle cx={p.x} cy={p.y} r="16" fill="#ffffff" stroke="#0ea5e9" strokeWidth="3" />
                                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0ea5e9">{i + 1}</text>
                                  </g>
                                ))}
                              </g>
                            )}
                          </svg>

                          {/* Corner badges (mock controls) */}
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow">
                            Mapa (mock)
                          </div>
                          <div className="absolute top-4 right-4">
                            <button className="rounded-full bg-emerald-500 text-white text-sm px-3 py-1 shadow">Ver</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Add Destination Modal */}
              <Dialog open={isAddDestOpen} onOpenChange={setIsAddDestOpen}>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Agregar nuevo destino</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="new-dest-name">Nombre del destino</Label>
                      <Input
                        id="new-dest-name"
                        value={newDestName}
                        onChange={(e) => setNewDestName(e.target.value)}
                        placeholder="Ej: Barcelona"
                        className="rounded-full"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-dest-days">Días</Label>
                      <Input
                        id="new-dest-days"
                        type="number"
                        min={1}
                        value={newDestDays}
                        onChange={(e) => setNewDestDays(parseInt(e.target.value || '1', 10))}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setIsAddDestOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="rounded-full bg-sky-500 hover:bg-sky-700"
                      onClick={handleConfirmAddDestination}
                      disabled={!newDestName.trim()}
                    >
                      Agregar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Trip details modal: start date and travelers */}
              <Dialog open={isTripDetailsOpen} onOpenChange={setIsTripDetailsOpen}>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>{currentItinerary.start_date ? 'Modificar viaje' : 'Agregar fecha y personas'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="trip-start-date">Fecha de inicio</Label>
                      <Input
                        id="trip-start-date"
                        type="date"
                        value={tripStartDate}
                        onChange={(e) => setTripStartDate(e.target.value)}
                        className="rounded-full"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="trip-travelers">Cantidad de personas</Label>
                      <Input
                        id="trip-travelers"
                        type="number"
                        min={1}
                        value={tripTravelersCount}
                        onChange={(e) => setTripTravelersCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setIsTripDetailsOpen(false)}
                      disabled={savingTripDetails}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="rounded-full bg-sky-500 hover:bg-sky-700"
                      onClick={async () => {
                        if (!tripStartDate) return;
                        try {
                          setSavingTripDetails(true);
                          const payload = {
                            start_date: tripStartDate, // ISO 8601 date-only
                            travelers_count: tripTravelersCount,
                          };
                          await apiRequest(`/api/itineraries/${itineraryId}`, {
                            method: 'PUT',
                            body: JSON.stringify(payload),
                          });
                          await fetchItinerary(itineraryId);
                          setIsTripDetailsOpen(false);
                        } finally {
                          setSavingTripDetails(false);
                        }
                      }}
                      disabled={!tripStartDate || savingTripDetails}
                    >
                      {savingTripDetails ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <TabsContent value="transport">
                {details_itinerary.destinos.length > 1 ? (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="space-y-4">
                      {(details_itinerary.transportes_entre_destinos ?? []).length > 0 ? (
                        (details_itinerary.transportes_entre_destinos ?? []).map((t, idx) => (
                          <div key={`transport-${idx}`} className="rounded-2xl border border-gray-100 p-5 bg-gray-50 hover:bg-gray-100/50 transition-colors">
                            <div className="flex items-center mb-3">
                              <div className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 mr-3">
                                {(() => {
                                  switch (t.tipo_transporte) {
                                    case 'Avión':
                                      return <PlaneIcon className="w-4 h-4" />;
                                    case 'Tren':
                                      return <TrainIcon className="w-4 h-4" />;
                                    case 'Colectivo':
                                      return <BusIcon className="w-4 h-4" />;
                                    case 'Auto':
                                      return <CarIcon className="w-4 h-4" />;
                                    case 'Barco':
                                      return <ShipIcon className="w-4 h-4" />;
                                    default:
                                      return <CircleHelpIcon className="w-4 h-4" />;
                                  }
                                })()}
                              </div>
                              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                                {t.ciudad_origen} → {t.ciudad_destino}
                              </h3>
                            </div>
                            <div className="ml-11 text-gray-700 space-y-2">
                              <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium">
                                {t.tipo_transporte}
                              </span>
                              <div className="h-px bg-gray-200"></div>
                              <div className="text-gray-700">{t.justificacion}</div>
                              <div className="text-gray-700"><span className="font-medium">Alternativas:</span> {t.alternativas}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        details_itinerary.destinos.map((dest, idx) => (
                          <div key={`transport-fallback-${idx}`} className="rounded-2xl border border-gray-100 p-5 bg-gray-50">
                            <div className="flex items-center">
                              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                {dest.ciudad}
                              </h2>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
                          <h2 className="text-2xl font-bold text-gray-900">{dest.ciudad}</h2>
                          <p className="text-gray-700 ml-1">• {dest.dias_en_destino} días</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {loadingAccommodationLinks && (
                            <span className="text-sm text-gray-600">Generando enlaces...</span>
                          )}
                          <a
                            href={accommodationLinks[dest.ciudad]?.airbnb ?? 'https://www.airbnb.com'}
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
                            href={accommodationLinks[dest.ciudad]?.booking ?? 'https://www.booking.com'}
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
                            href={accommodationLinks[dest.ciudad]?.expedia ?? 'https://www.expedia.com'}
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