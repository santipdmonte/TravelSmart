"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatPanel } from "@/components/chat";
import { apiRequest } from "@/lib/api";
import { FloatingEditButton, Button, Input } from "@/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarIcon,
  PlaneIcon,
  TrainIcon,
  BusIcon,
  CarIcon,
  ShipIcon,
  CircleHelpIcon,
  MapPinIcon,
} from "lucide-react";
import ItineraryMap from "@/components/itinerary/ItineraryMap";
import Image from "next/image";

export default function ItineraryDetailsPage() {
  const params = useParams();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { clearChat } = useChatActions();

  const itineraryId = params.id as string;

  // Hover state for destinations (used by map) - declare early before any returns
  const [hoveredDestinationIndex, setHoveredDestinationIndex] = useState<
    number | null
  >(null);

  // Mock state for accommodations per destino
  const [accommodationsByDest, setAccommodationsByDest] = useState<string[][]>(
    []
  );
  const [newLinkByDest, setNewLinkByDest] = useState<string[]>([]);
  // Route tab no longer supports editing or reordering
  const [activeTab, setActiveTab] = useState<string>("itinerary");
  const [isTripDetailsOpen, setIsTripDetailsOpen] = useState<boolean>(false);
  const [tripStartDate, setTripStartDate] = useState<string>("");
  const [tripTravelersCount, setTripTravelersCount] = useState<number>(1);
  const [savingTripDetails, setSavingTripDetails] = useState<boolean>(false);
  const [accommodationLinks, setAccommodationLinks] = useState<
    Record<string, { airbnb: string; booking: string; expedia: string }>
  >({});
  const [loadingAccommodationLinks, setLoadingAccommodationLinks] =
    useState<boolean>(false);

  // Helper to format short dates for display in the Ruta list
  const formatDateShort = (date: Date) =>
    date.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  // Compute per-destination date ranges if a trip start date exists
  const destinationDateRanges = useMemo(() => {
    const results: { start: Date; end: Date }[] = [];
    const startDateStr = currentItinerary?.start_date;
    const destinos = currentItinerary?.details_itinerary?.destinos ?? [];
    if (!startDateStr || destinos.length === 0) return results;
    try {
      let cursor = new Date(startDateStr);
      for (const dest of destinos) {
        const start = new Date(cursor);
        const end = new Date(cursor);
        const days = Number(dest.dias_en_destino) || 1;
        end.setDate(end.getDate() + Math.max(1, days) - 1);
        results.push({ start, end });
        // Move cursor to the next day after end
        cursor = new Date(end);
        cursor.setDate(cursor.getDate() + 1);
      }
    } catch (_) {
      return results;
    }
    return results;
  }, [
    currentItinerary?.start_date,
    currentItinerary?.details_itinerary?.destinos,
  ]);

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
      const q = encodeURIComponent(`${d.ciudad ?? ""}, ${d.pais ?? ""}`.trim());
      return [`https://www.booking.com/searchresults.html?ss=${q}`];
    });
    setAccommodationsByDest(seeded);
    setNewLinkByDest(currentItinerary.details_itinerary.destinos.map(() => ""));
  }, [currentItinerary]);

  // Fetch accommodation links from backend for 'stays' tab (supports with/without dates)
  const fetchAccommodationLinks = useCallback(async () => {
    if (!itineraryId) return;
    try {
      setLoadingAccommodationLinks(true);
      const res = await apiRequest<
        Record<string, { airbnb: string; booking: string; expedia: string }>
      >(`/api/itineraries/${itineraryId}/accommodations/links`);
      if (res.data) {
        setAccommodationLinks(res.data);
      } else {
        setAccommodationLinks({});
      }
    } catch (err) {
      // Silently keep fallbacks in the UI links
      setAccommodationLinks({});
    } finally {
      setLoadingAccommodationLinks(false);
    }
  }, [itineraryId]);

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
            <Button
              asChild
              className="bg-sky-500 hover:bg-sky-700 rounded-full"
            >
              <Link href="/itineraries">Volver a itinerarios</Link>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Itinerario no encontrado
            </h2>
            <p className="text-gray-700 mb-6">
              El itinerario que buscas no existe.
            </p>
            <Button
              asChild
              className="bg-sky-500 hover:bg-sky-700 rounded-full"
            >
              <Link href="/itineraries">Volver a itinerarios</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { details_itinerary } = currentItinerary;
  const hasMultipleDestinations = details_itinerary.destinos.length > 1;

  const handleAddLink = (destIndex: number) => {
    const url = (newLinkByDest[destIndex] || "").trim();
    if (!url) return;
    setAccommodationsByDest((prev) => {
      const next = prev.map((arr) => [...arr]);
      if (!next[destIndex]) next[destIndex] = [];
      next[destIndex].push(url);
      return next;
    });
    setNewLinkByDest((prev) => prev.map((v, i) => (i === destIndex ? "" : v)));
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
      <div
        className={`transition-all duration-300 ${
          isChatOpen ? "lg:mr-[33.333333%]" : ""
        }`}
      >
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
                  {currentItinerary.start_date
                    ? ` • ${new Date(
                        currentItinerary.start_date
                      ).toLocaleDateString()} (${
                        details_itinerary.cantidad_dias
                      } días)`
                    : ` • ${details_itinerary.cantidad_dias} días`}
                  {typeof currentItinerary.travelers_count === "number" &&
                  currentItinerary.travelers_count > 0
                    ? ` • ${currentItinerary.travelers_count} viajero${
                        currentItinerary.travelers_count > 1 ? "s" : ""
                      }`
                    : ""}
                </p>
              </div>
            </div>
            <div className="absolute top-6 right-6">
              <Badge className="rounded-full capitalize">
                {currentItinerary.status}
              </Badge>
            </div>
          </div>

          {/* Tabs mockup */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between">
                <div>
                  <TabsList className="bg-white border border-gray-200 rounded-full shadow-sm p-1 mb-2">
                    {hasMultipleDestinations && (
                      <TabsTrigger
                        value="route"
                        className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                      >
                        Ruta
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="itinerary"
                      className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                    >
                      Actividades
                    </TabsTrigger>
                    <TabsTrigger
                      value="transport"
                      className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                    >
                      Transporte
                    </TabsTrigger>
                    <TabsTrigger
                      value="stays"
                      className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                    >
                      Alojamientos
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex items-center">
                  {activeTab === "stays" && (
                    <Button
                      className="rounded-full bg-sky-500 hover:bg-sky-700"
                      onClick={() => {
                        setTripStartDate(
                          currentItinerary.start_date
                            ? new Date(currentItinerary.start_date)
                                .toISOString()
                                .slice(0, 10)
                            : ""
                        );
                        setTripTravelersCount(
                          currentItinerary.travelers_count ?? 1
                        );
                        setIsTripDetailsOpen(true);
                      }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {currentItinerary.start_date
                        ? "Modificar fecha viaje"
                        : "Agregar fecha viaje"}
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="itinerary">
                {/* Destinations */}
                <div className="space-y-4">
                  {details_itinerary.destinos.map((destination, destIndex) => (
                    <div
                      key={destIndex}
                      className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm hover:shadow-md transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 mr-3">
                            <MapPinIcon className="w-4 h-4" />
                          </div>
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                            {destination.ciudad}
                          </h2>
                        </div>
                        <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium">
                          {destination.dias_en_destino} días
                        </span>
                      </div>
                      <div className="ml-11">
                        <div className="h-px bg-gray-200 mb-2"></div>
                        <div className="text-gray-900 whitespace-pre-line">
                          {destination.actividades_sugeridas}
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
                      <div className="md:col-span-2 space-y-4">
                        {details_itinerary.destinos.map((dest, idx) => {
                          const range = destinationDateRanges[idx];
                          return (
                            <div
                              key={`route-left-${idx}`}
                              className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                              onMouseEnter={() =>
                                setHoveredDestinationIndex(idx)
                              }
                              onMouseLeave={() =>
                                setHoveredDestinationIndex(null)
                              }
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shadow border ${
                                    hoveredDestinationIndex === idx
                                      ? "bg-sky-500 text-white border-sky-500"
                                      : "bg-white text-sky-600 border-sky-400"
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {dest.ciudad}
                                    </h3>
                                    <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium">
                                      {dest.dias_en_destino} días
                                    </span>
                                  </div>
                                  {range && (
                                    <div className="text-gray-500 text-sm mt-1">
                                      {formatDateShort(range.start)} —{" "}
                                      {formatDateShort(range.end)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Interactive map */}
                      <div className="md:col-span-3 h-80 md:h-[420px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative">
                        <ItineraryMap
                          itinerary={currentItinerary}
                          hoveredDestinationIndex={hoveredDestinationIndex}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Add Destination Modal removed */}

              {/* Trip details modal: start date and travelers */}
              <Dialog
                open={isTripDetailsOpen}
                onOpenChange={setIsTripDetailsOpen}
              >
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>
                      {currentItinerary.start_date
                        ? "Modificar viaje"
                        : "Agregar fecha y personas"}
                    </DialogTitle>
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
                      <Label htmlFor="trip-travelers">
                        Cantidad de personas
                      </Label>
                      <Input
                        id="trip-travelers"
                        type="number"
                        min={1}
                        value={tripTravelersCount}
                        onChange={(e) =>
                          setTripTravelersCount(
                            Math.max(1, parseInt(e.target.value || "1", 10))
                          )
                        }
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
                            method: "PUT",
                            body: JSON.stringify(payload),
                          });
                          await fetchItinerary(itineraryId);
                          await fetchAccommodationLinks();
                          setIsTripDetailsOpen(false);
                        } finally {
                          setSavingTripDetails(false);
                        }
                      }}
                      disabled={!tripStartDate || savingTripDetails}
                    >
                      {savingTripDetails ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <TabsContent value="transport">
                {details_itinerary.destinos.length > 1 ? (
                  // <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <div className="space-y-4">
                    {(details_itinerary.transportes_entre_destinos ?? [])
                      .length > 0
                      ? (
                          details_itinerary.transportes_entre_destinos ?? []
                        ).map((t, idx) => (
                          <div
                            key={`transport-${idx}`}
                            className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm hover:shadow-md transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 mr-3">
                                  {(() => {
                                    switch (t.tipo_transporte) {
                                      case "Avión":
                                        return (
                                          <PlaneIcon className="w-4 h-4" />
                                        );
                                      case "Tren":
                                        return (
                                          <TrainIcon className="w-4 h-4" />
                                        );
                                      case "Colectivo":
                                        return <BusIcon className="w-4 h-4" />;
                                      case "Auto":
                                        return <CarIcon className="w-4 h-4" />;
                                      case "Barco":
                                        return <ShipIcon className="w-4 h-4" />;
                                      default:
                                        return (
                                          <CircleHelpIcon className="w-4 h-4" />
                                        );
                                    }
                                  })()}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                                  {t.ciudad_origen} → {t.ciudad_destino}
                                </h3>
                              </div>
                              <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium">
                                {t.tipo_transporte}
                              </span>
                            </div>
                            <div className="ml-11 text-gray-700 space-y-2">
                              <div className="h-px bg-gray-200"></div>
                              <div className="text-gray-900">
                                {t.justificacion}
                              </div>
                              <div className="text-gray-500">
                                <span className="font-medium">
                                  Alternativas:
                                </span>{" "}
                                {t.alternativas}
                              </div>
                            </div>
                          </div>
                        ))
                      : details_itinerary.destinos.map((dest, idx) => (
                          <div
                            key={`transport-fallback-${idx}`}
                            className="rounded-2xl border border-gray-100 p-5 bg-gray-50"
                          >
                            <div className="flex items-center">
                              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                {dest.ciudad}
                              </h2>
                            </div>
                          </div>
                        ))}
                  </div>
                ) : (
                  // </div>
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-gray-600">
                    <p>
                      Agrega más de un destino para ver las conexiones de
                      transporte.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stays">
                <div className="space-y-6">
                  {details_itinerary.destinos.map((dest, idx) => (
                    <div
                      key={`stay-${idx}`}
                      className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {dest.ciudad}
                          </h2>
                          <p className="text-gray-700 ml-1">
                            • {dest.dias_en_destino} días
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {loadingAccommodationLinks && (
                            <span className="text-sm text-gray-600">
                              Generando enlaces...
                            </span>
                          )}
                          <a
                            href={
                              accommodationLinks[`${dest.ciudad}, ${dest.pais}`]
                                ?.airbnb ?? "https://www.airbnb.com"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors"
                            style={{ backgroundColor: "#FF5A5F" }}
                          >
                            <Image
                              src="/accommodations-ico/airbnb.avif"
                              alt="Airbnb"
                              width={20}
                              height={20}
                              className="rounded-sm h-5 w-5"
                            />
                            Airbnb
                          </a>

                          <a
                            href={
                              accommodationLinks[`${dest.ciudad}, ${dest.pais}`]
                                ?.booking ?? "https://www.booking.com"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors bg-[#003580] hover:bg-[#00224F]"
                          >
                            <Image
                              src="/accommodations-ico/booking.svg"
                              alt="Booking.com"
                              width={20}
                              height={20}
                              className="h-5 w-5"
                            />
                            Booking
                          </a>

                          <a
                            href={
                              accommodationLinks[`${dest.ciudad}, ${dest.pais}`]
                                ?.expedia ?? "https://www.expedia.com"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md transition-colors bg-[#1F2B6C] hover:bg-[#172059]"
                          >
                            <Image
                              src="/accommodations-ico/expedia.ico"
                              alt="Expedia"
                              width={20}
                              height={20}
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
                            value={newLinkByDest[idx] ?? ""}
                            onChange={(e) =>
                              setNewLinkByDest((prev) =>
                                prev.map((v, i) =>
                                  i === idx ? e.target.value : v
                                )
                              )
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
                          {(accommodationsByDest[idx] ?? []).map(
                            (link, linkIdx) => (
                              <li
                                key={`${idx}-${linkIdx}`}
                                className="flex items-center justify-between gap-3 border border-gray-100 rounded-full px-4 py-2"
                              >
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
                            )
                          )}
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
