"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { useChat } from "@/contexts/AgentContext";
import { useChatActions } from "@/hooks/useChatActions";
import { useToast } from "@/contexts/ToastContext";
import { ChatPanel } from "@/components/chat";
import { apiRequest } from "@/lib/api";
import { parseLocalDate } from "@/lib/utils";
import {
  listAccommodationsByItineraryAndCity,
  createAccommodation,
  softDeleteAccommodation,
} from "@/lib/accommodationApi";
import { AccommodationResponse } from "@/types/accommodation";
import { FloatingEditButton, Button, Input } from "@/components";
import { Card, CardContent, CardTitle, Skeleton } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  PlaneIcon,
  TrainIcon,
  BusIcon,
  CarIcon,
  ShipIcon,
  CircleHelpIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import ItineraryMap from "@/components/itinerary/ItineraryMap";
import Image from "next/image";

export default function ItineraryDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentItinerary, loading, error } = useItinerary();
  const { fetchItinerary, removeItinerary } = useItineraryActions();
  const { isOpen: isChatOpen, threadId } = useChat();
  const { clearChat, openChat, sendMessage } = useChatActions();
  const { toastState, showToast } = useToast();

  const itineraryId = params.id as string;
  
  // Get initial tab from URL query param or default to "route"
  const tabFromUrl = searchParams.get("tab") || "route";

  // Hover state for destinations (used by map) - declare early before any returns
  const [hoveredDestinationIndex, setHoveredDestinationIndex] = useState<
    number | null
  >(null);

  // Saved accommodations per destino (persisted via backend)
  const [accommodationsByDest, setAccommodationsByDest] = useState<
    AccommodationResponse[][]
  >([]);
  const [newLinkByDest, setNewLinkByDest] = useState<string[]>([]);
  const [isCreatingByDest, setIsCreatingByDest] = useState<boolean[]>([]);
  const [imageIndexByAccId, setImageIndexByAccId] = useState<Record<string, number>>({});
  // Cache to track if accommodations have been fetched for current itinerary
  const [accommodationsFetched, setAccommodationsFetched] = useState<boolean>(false);
  // Route tab no longer supports editing or reordering
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const [isTripDetailsOpen, setIsTripDetailsOpen] = useState<boolean>(false);
  const [tripStartDate, setTripStartDate] = useState<string>("");
  const [tripTravelersCount, setTripTravelersCount] = useState<number>(1);
  const [savingTripDetails, setSavingTripDetails] = useState<boolean>(false);
  const [accommodationLinks, setAccommodationLinks] = useState<
    Record<string, { airbnb: string; booking: string; expedia: string }>
  >({});
  const [loadingAccommodationLinks, setLoadingAccommodationLinks] =
    useState<boolean>(false);
  // Toggle state for transport alternatives per item index
  const [openAlternatives, setOpenAlternatives] = useState<Record<number, boolean>>({});
  // Toggle state for accommodation suggestions per destination index
  const [openAccommodationSuggestions, setOpenAccommodationSuggestions] = useState<Record<number, boolean>>({});
  // Expand/collapse for individual activities (by day index and activity index)
  const [openActivities, setOpenActivities] = useState<Record<string, boolean>>({});
  // Delete itinerary dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // Minimal markdown to HTML renderer for headings, lists, bold/italic/code and paragraphs
  const renderMarkdown = useCallback(function renderMarkdown(md: string) {
    try {
      const escapeHtml = (str: string) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      const lines = md.split(/\r?\n/);
      let html = "";
      let inList = false;
      const flushList = () => {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
      };
      for (const raw of lines) {
        const line = raw;
        // Headings
        const h3 = line.match(/^###\s+(.*)$/);
        const h2 = line.match(/^##\s+(.*)$/);
        const h1 = line.match(/^#\s+(.*)$/);
        if (h3 || h2 || h1) {
          flushList();
          const text = escapeHtml((h3?.[1] || h2?.[1] || h1?.[1] || "").trim());
          if (h1) html += `<h1 class=\"text-xl font-semibold mt-3 mb-2\">${text}</h1>`;
          else if (h2) html += `<h2 class=\"text-lg font-semibold mt-3 mb-2\">${text}</h2>`;
          else html += `<h3 class=\"text-base font-semibold mt-3 mb-2\">${text}</h3>`;
          continue;
        }
        // Unordered list
        const li = line.match(/^\s*[-*]\s+(.*)$/);
        if (li) {
          if (!inList) {
            html += '<ul class=\"list-disc pl-5 space-y-1\">';
            inList = true;
          }
          let item = escapeHtml(li[1]);
          item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>');
          item = item.replace(/`([^`]+)`/g, '<code class=\"px-1 py-0.5 bg-gray-100 rounded\">$1<\/code>');
          item = item.replace(/_(.*?)_/g, '<em>$1<\/em>');
          html += `<li>${item}</li>`;
          continue;
        }
        // Empty line -> paragraph break
        if (!line.trim()) {
          flushList();
          html += "<br/>";
          continue;
        }
        // Paragraph
        flushList();
        let paragraph = escapeHtml(line);
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1<\/strong>');
        paragraph = paragraph.replace(/`([^`]+)`/g, '<code class=\"px-1 py-0.5 bg-gray-100 rounded\">$1<\/code>');
        paragraph = paragraph.replace(/_(.*?)_/g, '<em>$1<\/em>');
        html += `<p class=\"leading-relaxed\">${paragraph}</p>`;
      }
      if (inList) html += "</ul>";
      return html;
    } catch {
      return md;
    }
  }, []);
  // Confirm route modal state
  const [isConfirmRouteOpen, setIsConfirmRouteOpen] = useState<boolean>(false);
  const [confirmingRoute, setConfirmingRoute] = useState<boolean>(false);
  
  // Delete itinerary modal state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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
      let cursor = parseLocalDate(startDateStr);
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
    } catch {
      return results;
    }
    return results;
  }, [
    currentItinerary?.start_date,
    currentItinerary?.details_itinerary?.destinos,
  ]);

  // Guard against StrictMode double-invocation
  const fetchedItineraryRef = useRef<string | null>(null);
  useEffect(() => {
    if (itineraryId) {
      if (fetchedItineraryRef.current === itineraryId) return;
      fetchedItineraryRef.current = itineraryId;
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

  // Initialize input rows when destinos change
  useEffect(() => {
    const destinos = currentItinerary?.details_itinerary?.destinos ?? [];
    setNewLinkByDest(destinos.map(() => ""));
    setIsCreatingByDest(destinos.map(() => false));
    // Reset accommodations cache when itinerary changes
    setAccommodationsFetched(false);
  }, [currentItinerary?.details_itinerary?.destinos]);

  // Fetch accommodation links from backend for 'stays' tab (supports with/without dates)
  const fetchedLinksForRef = useRef<string | null>(null);
  const fetchAccommodationLinks = useCallback(async (force: boolean = false) => {
    if (!itineraryId) return;
    if (!force && fetchedLinksForRef.current === itineraryId) return;
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
      fetchedLinksForRef.current = itineraryId;
    } catch {
      // Silently keep fallbacks in the UI links
      setAccommodationLinks({});
    } finally {
      setLoadingAccommodationLinks(false);
    }
  }, [itineraryId]);

  useEffect(() => {
    fetchAccommodationLinks(false);
  }, [fetchAccommodationLinks]);

  // Load saved accommodations from backend per destination
  const fetchSavedAccommodations = useCallback(async (force: boolean = false) => {
    if (!currentItinerary) return;
    
    // If already fetched and not forcing, skip the API calls
    if (accommodationsFetched && !force) return;
    
    const destinos = currentItinerary.details_itinerary.destinos ?? [];
    if (!Array.isArray(destinos) || destinos.length === 0) {
      setAccommodationsByDest([]);
      setAccommodationsFetched(true);
      return;
    }
    
    try {
      const results = await Promise.all(
        destinos.map((d) =>
          listAccommodationsByItineraryAndCity(itineraryId, d.ciudad)
        )
      );
      const mapped: AccommodationResponse[][] = results.map((res) =>
        (res.data ?? []).filter((a) => a.status !== "deleted")
      );
      setAccommodationsByDest(mapped);
      setAccommodationsFetched(true);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      // Don't set accommodationsFetched to true on error so it can be retried
    }
  }, [currentItinerary, itineraryId, accommodationsFetched]);

  // Fetch when opening the stays tab or when itinerary changes
  useEffect(() => {
    if (activeTab === "stays") {
      fetchSavedAccommodations(false);
    }
  }, [activeTab, fetchSavedAccommodations]);

  // Sync activeTab with URL query param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Helper function to change tab and update URL
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    // Update URL with new tab param using replaceState (faster, no navigation)
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, []);


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
    const isNotFound = /404|no encontrado|no encontramos/i.test(error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md">
            {isNotFound ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No encontramos tu itinerario</h2>
                <p className="text-gray-700 mb-6">
                  Es posible que haya sido eliminado o que el enlace esté incompleto.
                  {itineraryId ? ` (ID: ${String(itineraryId).slice(0, 8)}…)` : ""}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/itineraries">Volver a itinerarios</Link>
                  </Button>
                  <Button asChild className="bg-sky-500 hover:bg-sky-700 rounded-full">
                    <Link href="/create">Crear nuevo</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-700 mb-6">{error}</p>
                <Button
                  asChild
                  className="bg-sky-500 hover:bg-sky-700 rounded-full"
                >
                  <Link href="/itineraries">Volver a itinerarios</Link>
                </Button>
              </>
            )}
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
  const isRouteConfirmed = ((currentItinerary as unknown as { status?: string })?.status || "") === "confirmed";

  const handleSetTransportPrimary = async (fromCity: string, toCity: string, transport: string) => {
    try {
      await openChat(itineraryId);
      const msg = `Establecer "${transport}" como transporte principal entre ${fromCity} y ${toCity}`;
      await sendMessage(itineraryId, msg);
    } catch {
      // no-op
    }
  };

  const handleGenerateDailyActivities = async () => {
    setIsConfirmRouteOpen(true);
  };

  const handleConfirmRoute = async () => {
    setIsConfirmRouteOpen(true);
  };

  const handleConfirmRouteProceed = async () => {
    try {
      setConfirmingRoute(true);
      // Close modal immediately and switch to activities tab
      setIsConfirmRouteOpen(false);
      handleTabChange("itinerary");
      
      // Show pending toast
      showToast("pending", "Generando actividades diarias...", "", 5000);
      
      // Fire POST request and track its status
      (async () => {
        try {
          const response = await apiRequest(`/api/itineraries/${itineraryId}/route_confirmed`, {
            method: "POST",
          });
          
          if (response.data && !response.error) {
            // Success: show toast for 4 seconds with link to activities tab
            showToast("success", "¡Actividades diarias generadas!", `<a href="/itinerary/${itineraryId}?tab=itinerary">Ver en Actividades</a>`, 4000);
            // Refresh to get updated itinerary with confirmed status
            fetchItinerary(itineraryId);
          } else {
            // Error response or no data - only log if unexpected
            const errorMsg = response.error || "Unknown error";
            // Only log 5xx server errors, not 4xx client errors
            if (!errorMsg.includes("404") && !errorMsg.includes("400") && !errorMsg.includes("403")) {
              console.error("Error confirming route:", errorMsg);
            }
            showToast("error", "Error al generar actividades", "Inténtalo de nuevo más tarde", 5000);
          }
        } catch (err) {
          // Unexpected errors (network, etc)
          console.error("Unexpected error confirming route:", err);
          showToast("error", "Error al confirmar", "Inténtalo de nuevo más tarde", 5000);
        }
      })();
    } finally {
      setConfirmingRoute(false);
    }
  };

  const handleAddLink = async (destIndex: number) => {
    const url = (newLinkByDest[destIndex] || "").trim();
    if (!url || !currentItinerary) return;
    const city = currentItinerary.details_itinerary.destinos[destIndex]?.ciudad;
    if (!city) return;
    try {
      setIsCreatingByDest((prev) => prev.map((v, i) => (i === destIndex ? true : v)));
      await createAccommodation({
        itinerary_id: currentItinerary.itinerary_id,
        city,
        url,
      });
      await fetchSavedAccommodations(true);
      setNewLinkByDest((prev) => prev.map((v, i) => (i === destIndex ? "" : v)));
    } finally {
      setIsCreatingByDest((prev) => prev.map((v, i) => (i === destIndex ? false : v)));
    }
  };

  const handleDeleteLink = async (accommodationId: string) => {
    await softDeleteAccommodation(accommodationId);
    await fetchSavedAccommodations(true);
  };

  const handleDeleteItinerary = async () => {
    if (!itineraryId) return;
    
    setIsDeleting(true);
    try {
      const result = await removeItinerary(itineraryId);
      
      if (result.success) {
        // Close modal before showing toast and redirecting
        setIsDeleteDialogOpen(false);
        showToast("success", "Itinerario eliminado", "El itinerario ha sido eliminado exitosamente", 3000);
        // Small delay before redirect to ensure modal closes properly
        setTimeout(() => {
          router.push("/itineraries");
        }, 100);
      } else {
        // Show error but keep modal open so user can try again or cancel
        showToast("error", "Error al eliminar", result.error || "No se pudo eliminar el itinerario", 5000);
        setIsDeleting(false);
      }
    } catch {
      // Show error but keep modal open
      showToast("error", "Error al eliminar", "Ocurrió un error inesperado", 5000);
      setIsDeleting(false);
    }
  };

  const getCurrentImageUrl = (acc: AccommodationResponse): string | undefined => {
    const total = acc.img_urls?.length ?? 0;
    if (total === 0) return undefined;
    const idx = imageIndexByAccId[acc.id] ?? 0;
    const safeIdx = ((idx % total) + total) % total;
    return acc.img_urls[safeIdx];
  };

  const showPrevImage = (accId: string, total: number) => {
    if (!total || total < 2) return;
    setImageIndexByAccId((prev) => ({
      ...prev,
      [accId]: ((prev[accId] ?? 0) - 1 + total) % total,
    }));
  };

  const showNextImage = (accId: string, total: number) => {
    if (!total || total < 2) return;
    setImageIndexByAccId((prev) => ({
      ...prev,
      [accId]: ((prev[accId] ?? 0) + 1) % total,
    }));
  };

  return (
    <div className="bg-gray-50">
      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isChatOpen ? "lg:mr-[33.333333%]" : ""
        }`}
      >
        <div className="container mx-auto px-4 pb-4">
          {/* Itinerary Header
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8 relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {details_itinerary.nombre_viaje}
                </h1>
                <p className="text-gray-700">
                  {details_itinerary.destino_general}
                  {currentItinerary.start_date
                    ? ` • ${parseLocalDate(
                        currentItinerary.start_date
                      ).toLocaleDateString('es-ES')} (${
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
          </div> */}

          {/* Tabs container */}
          <div>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="flex justify-between">
                <div>
                  <TabsList className="bg-white border border-gray-200 rounded-full shadow-sm p-1 mb-2">
                    {hasMultipleDestinations && (
                      <TabsTrigger
                        value="route"
                        className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                      >
                        General
                      </TabsTrigger>
                    )}
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
                    <TabsTrigger
                      value="itinerary"
                      className="rounded-full px-4 py-2 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700"
                    >
                      Actividades
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex items-center">
                  {activeTab === "stays" && (
                    <Button
                      className="rounded-full bg-sky-500 hover:bg-sky-700"
                      onClick={() => {
                        setTripStartDate(
                          currentItinerary.start_date || ""
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
                {!isRouteConfirmed && (
                  <>
                    {toastState.status === "idle" ? (
                      <div className="flex items-center justify-center min-h-[400px] px-4">
                        <div className="max-w-2xl w-full">
                          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl shadow-lg p-8">
                            <div className="flex flex-col items-center text-center">
                              <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center mb-4">
                                <CircleHelpIcon className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Confirma tu ruta para continuar
                              </h3>
                              <p className="text-base text-gray-700 mb-6 leading-relaxed max-w-xl">
                                Luego de confirmar la ruta elegida (destinos y días) se generarán las actividades diarias organizadas por mañana, tarde y noche, con detalles como horarios, precios, ubicaciones y links de reserva.
                              </p>
                              <Button
                                size="lg"
                                className="rounded-full bg-sky-500 hover:bg-sky-700 text-white px-8 py-6 text-lg font-semibold shadow-md"
                                onClick={handleGenerateDailyActivities}
                              >
                                Confirmar ruta y generar actividades diarias
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[400px] px-4">
                        <div className="max-w-2xl w-full">
                          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl shadow-lg p-8">
                            <div className="flex flex-col items-center text-center">
                              <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-sky-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Generando actividades diarias...
                              </h3>
                              <p className="text-base text-gray-700 leading-relaxed max-w-xl">
                                Estamos creando tu itinerario personalizado con actividades organizadas por horarios, precios, ubicaciones y enlaces de reserva.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Check if we have itinerario_diario in details_itinerary */}
                {isRouteConfirmed && Array.isArray(details_itinerary.itinerario_diario) && details_itinerary.itinerario_diario.length > 0 ? (
                  <div className="space-y-4">
                    {/* Display resumen_itinerario if available */}
                    {details_itinerary.resumen_itinerario && (
                      <div className="rounded-2xl border border-gray-100 p-6 bg-white shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Resumen del Itinerario</h2>
                        <div className="h-px bg-gray-200 mb-4"></div>
                        <div
                          className="prose max-w-none text-gray-800"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(details_itinerary.resumen_itinerario) }}
                        />
                      </div>
                    )}
                    
                    {/* Display daily itineraries - Days shown expanded, activities collapsed */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {details_itinerary.itinerario_diario.map((dailyItem: any, dayIndex: number) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const renderActivitySection = (activities: any[], timeOfDay: string) => {
                        if (!Array.isArray(activities) || activities.length === 0) return null;
                        
                        return (
                          <div className="mb-4">
                            <h4 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                              {timeOfDay === 'mañana' && '🌅 Mañana'}
                              {timeOfDay === 'tarde' && '☀️ Tarde'}
                              {timeOfDay === 'noche' && '🌙 Noche'}
                            </h4>
                            <div className="space-y-2">
                              {activities.map((activity, actIdx) => {
                                const activityKey = `${dayIndex}-${timeOfDay}-${actIdx}`;
                                const isActivityOpen = !!openActivities[activityKey];
                                
                                return (
                                  <div
                                    key={activityKey}
                                    className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                                  >
                                    <button
                                      onClick={() =>
                                        setOpenActivities((prev) => ({
                                          ...prev,
                                          [activityKey]: !prev[activityKey],
                                        }))
                                      }
                                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors text-left"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="text-gray-900 font-medium">
                                          {activity.titulo}
                                        </span>
                                      </div>
                                      {isActivityOpen ? (
                                        <ChevronUpIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                      ) : (
                                        <ChevronDownIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                      )}
                                    </button>
                                    
                                    {isActivityOpen && (
                                      <div className="px-3 pb-3 space-y-2 text-sm">
                                        {activity.descripcion && (
                                          <div>
                                            <span className="font-semibold text-gray-700">Descripción: </span>
                                            <span className="text-gray-600">{activity.descripcion}</span>
                                          </div>
                                        )}
                                        
                                        {activity.ubicacion && (
                                          <div className="flex items-start gap-1">
                                            <MapPinIcon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">{activity.ubicacion}</span>
                                          </div>
                                        )}
                                        
                                        {activity.horarios && (
                                          <div>
                                            <span className="font-semibold text-gray-700">Horarios: </span>
                                            <span className="text-gray-600">{activity.horarios}</span>
                                          </div>
                                        )}
                                        
                                        {activity.precio && (
                                          <div>
                                            <span className="font-semibold text-gray-700">Precio: </span>
                                            <span className="text-gray-600">{activity.precio}</span>
                                          </div>
                                        )}
                                        
                                        {activity.transporte_recomendado && (
                                          <div>
                                            <span className="font-semibold text-gray-700">Transporte: </span>
                                            <span className="text-gray-600">{activity.transporte_recomendado}</span>
                                          </div>
                                        )}
                                        
                                        {activity.requisitos_reserva && (
                                          <div>
                                            <span className="font-semibold text-gray-700">Reserva: </span>
                                            <span className="text-gray-600">{activity.requisitos_reserva}</span>
                                          </div>
                                        )}
                                        
                                        {activity.enlace && (
                                          <div>
                                            <a
                                              href={activity.enlace}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline"
                                            >
                                              Ver más información →
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      };
                      
                      return (
                        <div
                          key={`day-${dayIndex}`}
                          className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm"
                        >
                          <div className="flex items-center mb-4">
                            <div className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-sky-500 text-white mr-3 flex-shrink-0">
                              <span className="text-base font-bold">{dailyItem.dia || dayIndex + 1}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                              {dailyItem.titulo || `Día ${dailyItem.dia || dayIndex + 1} - ${dailyItem.ciudad}`}
                            </h2>
                          </div>
                          
                          <div className="ml-12">
                            {renderActivitySection(dailyItem.actividades_mañana, 'mañana')}
                            {renderActivitySection(dailyItem.actividades_tarde, 'tarde')}
                            {renderActivitySection(dailyItem.actividades_noche, 'noche')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </TabsContent>

              {/* Route tab content */}
              <TabsContent value="route">
                {/* Integrated card with header, summary and content */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative">
                  {/* Actions dropdown - top right corner */}
                  <div className="absolute top-6 right-6">
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full h-9 w-9 p-0"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(false);
                            // Use setTimeout to ensure dropdown closes before opening dialog
                            setTimeout(() => {
                              setIsDeleteDialogOpen(true);
                            }, 100);
                          }}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Eliminar itinerario
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Header + Summary */}
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {details_itinerary.nombre_viaje}
                          </h1>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Eliminar itinerario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {/* Trip summary chips */}
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                          <span className="inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1">
                            {details_itinerary.destinos.length} destinos
                          </span>
                          <span className="inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1">
                            {details_itinerary.cantidad_dias} días
                          </span>
                          {typeof currentItinerary.travelers_count === "number" && (
                            <span className="inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1">
                              {currentItinerary.travelers_count} viajero{currentItinerary.travelers_count > 1 ? "s" : ""}
                            </span>
                          )}
                          {currentItinerary.start_date && (
                            <span className="inline-flex rounded-full bg-sky-50 text-sky-700 px-3 py-1">
                              Inicio {parseLocalDate(currentItinerary.start_date).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        {/* Itinerary Resume */}
                        <div className="text-gray-700">
                          {details_itinerary.resumen_viaje}
                        </div>
                      </div>
                    </div>
                  </div>
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
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {dest.ciudad}
                                  </h3>
                                  <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap flex-shrink-0">
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
                      {!isRouteConfirmed && toastState.status === "idle" && (
                        <div>
                          <Button
                            className="w-full rounded-xl bg-sky-500 hover:bg-sky-700 px-4 py-6 text-white text-base font-semibold shadow-sm"
                            onClick={handleConfirmRoute}
                          >
                            Confirmar ruta
                          </Button>
                        </div>
                      )}
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
                          await fetchAccommodationLinks(true);
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

            {/* Confirm route modal */}
            <Dialog
              open={isConfirmRouteOpen}
              onOpenChange={setIsConfirmRouteOpen}
            >
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Confirmar ruta</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Al confirmar la ruta:
                  </p>
                  <ul className="list-disc pl-5">
                    <li>Se confirmarán los destinos.</li>
                    <li>Se confirmará la cantidad de días por destino.</li>
                    <li>Se generará un itinerario diario con las actividades organizadas por día y recomendaciones.</li>
                  </ul>
                  <p>¿Deseas continuar?</p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setIsConfirmRouteOpen(false)}
                    disabled={confirmingRoute}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="rounded-full bg-sky-500 hover:bg-sky-700"
                    onClick={handleConfirmRouteProceed}
                    disabled={confirmingRoute}
                  >
                    {confirmingRoute ? "Confirmando..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete itinerary confirmation modal */}
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                if (!isDeleting) {
                  setIsDeleteDialogOpen(open);
                }
              }}
              modal={true}
            >
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>¿Eliminar itinerario?</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Esta acción eliminará permanentemente el itinerario{" "}
                    <strong>&ldquo;{details_itinerary.nombre_viaje}&rdquo;</strong>.
                  </p>
                  <p>
                    No podrás recuperar esta información después de eliminarla.
                  </p>
                  <p className="text-sm text-gray-600">
                    ¿Estás seguro de que deseas continuar?
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="rounded-full bg-red-500 hover:bg-red-700"
                    onClick={handleDeleteItinerary}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
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
                              <div>
                                <button
                                  className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                                  onClick={() =>
                                    setOpenAlternatives((prev) => ({
                                      ...prev,
                                      [idx]: !prev[idx],
                                    }))
                                  }
                                  aria-expanded={!!openAlternatives[idx]}
                                  aria-controls={`alternatives-${idx}`}
                                >
                                  {openAlternatives[idx] ? (
                                    <ChevronUpIcon className="h-4 w-4" />
                                  ) : (
                                    <ChevronDownIcon className="h-4 w-4" />
                                  )}
                                  Alternativas
                                </button>
                                {openAlternatives[idx] && Array.isArray(t.alternativas) && t.alternativas.length > 0 ? (
                                  <ul
                                    id={`alternatives-${idx}`}
                                    className="mt-2 pl-0 list-none text-gray-900 space-y-1"
                                  >
                                    {t.alternativas.map((alt, aidx) => (
                                      <li key={`alt-${idx}-${aidx}`}>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button
                                              className="inline-block text-left whitespace-normal break-words rounded-full px-3 py-1 text-gray-900 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer data-[state=open]:bg-sky-50 data-[state=open]:text-sky-700"
                                            >
                                              {alt}
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            <DropdownMenuItem onClick={() => handleSetTransportPrimary(t.ciudad_origen, t.ciudad_destino, alt)}>
                                              Establecer como transporte principal
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
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
                <div className="space-y-4">
                  {details_itinerary.destinos.map((dest, idx) => (
                    <div
                      key={`stay-${idx}`}
                      className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm hover:shadow-md transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                        <div className="flex items-center">
                          <div className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 mr-3">
                            <MapPinIcon className="w-4 h-4" />
                          </div>
                          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                            {dest.ciudad}
                          </h2>
                          <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium ml-2">
                            {dest.dias_en_destino} días
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
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
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white text-sm border border-gray-200 shadow-sm transition-all hover:shadow-md hover:scale-105"
                            style={{ backgroundColor: "#FF5A5F" }}
                          >
                            <Image
                              src="/accommodations-ico/airbnb.avif"
                              alt="Airbnb"
                              width={16}
                              height={16}
                              className="rounded-sm h-4 w-4"
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
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white text-sm border border-gray-200 shadow-sm transition-all bg-[#003580] hover:bg-[#00224F] hover:shadow-md hover:scale-105"
                          >
                            <Image
                              src="/accommodations-ico/booking.svg"
                              alt="Booking.com"
                              width={16}
                              height={16}
                              className="h-4 w-4"
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
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white text-sm border border-gray-200 shadow-sm transition-all bg-[#1F2B6C] hover:bg-[#172059] hover:shadow-md hover:scale-105"
                          >
                            <Image
                              src="/accommodations-ico/expedia.ico"
                              alt="Expedia"
                              width={16}
                              height={16}
                              className="h-4 w-4"
                            />
                            Expedia
                          </a>
                        </div>
                      </div>

                      {/* Saved accommodations */}
                      <div className="ml-11">
                        <div className="h-px bg-gray-200 mb-4"></div>
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2 w-2/5">
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
                              className="rounded-full w-full max-w-md"
                            />
                            <Button
                              className="rounded-full bg-sky-500 hover:bg-sky-700 px-5 flex-shrink-0"
                              onClick={() => handleAddLink(idx)}
                            >
                              Agregar
                            </Button>
                          </div>

                          <div>
                            <button
                                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                                onClick={() =>
                                  setOpenAccommodationSuggestions((prev) => ({
                                    ...prev,
                                    [idx]: !prev[idx],
                                  }))
                                }
                                aria-expanded={!!openAccommodationSuggestions[idx]}
                                aria-controls={`accommodation-suggestions-${idx}`}
                              >
                                {openAccommodationSuggestions[idx] ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )}
                                Sugerencias de alojamiento
                              </button>
                          </div>

                        </div>

                        {((accommodationsByDest[idx] ?? []).length > 0 || isCreatingByDest[idx]) && (
                          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <div className="flex pb-4 gap-4 pt-3">
                            {isCreatingByDest[idx] && (
                              <div className="relative w-56 flex-none">
                                <Card className="rounded-xl overflow-hidden border border-gray-100 shadow-sm pt-0">
                                  <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                                    <Skeleton className="h-full w-full" />
                                  </div>
                                  <CardContent>
                                    <CardTitle className="text-sm font-semibold truncate">
                                      <Skeleton className="h-4 w-3/4" />
                                    </CardTitle>
                                    <div className="text-xs text-gray-500 mt-1">
                                      <Skeleton className="h-3 w-1/2" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                            {(accommodationsByDest[idx] ?? []).map((acc) => {
                              const total = acc.img_urls?.length ?? 0;
                              const currentUrl = getCurrentImageUrl(acc);
                              return (
                                <div key={`${idx}-${acc.id}`} className="relative group w-56 flex-none">
                                  <a
                                    href={acc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <Card className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow pt-0">
                                      <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                                        {currentUrl ? (
                                          <Image
                                            src={currentUrl}
                                            alt={acc.title || "Alojamiento"}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            fill
                                            sizes="224px"
                                          />
                                        ) : (
                                          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                                        )}
                                        {total > 1 && (
                                          <>
                                            <button
                                              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/80 backdrop-blur text-gray-700 shadow hover:bg-white"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                showPrevImage(acc.id, total);
                                              }}
                                              aria-label="Imagen anterior"
                                            >
                                              <ChevronLeftIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/80 backdrop-blur text-gray-700 shadow hover:bg-white"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                showNextImage(acc.id, total);
                                              }}
                                              aria-label="Imagen siguiente"
                                            >
                                              <ChevronRightIcon className="h-4 w-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                      <CardContent>
                                        <CardTitle className="text-sm font-semibold truncate">
                                          {acc.title || acc.url}
                                        </CardTitle>
                                        {acc.provider ? (
                                          <div className="text-xs text-gray-500 mt-1">{acc.provider}</div>
                                        ) : null}
                                      </CardContent>
                                    </Card>
                                  </a>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-3 right-3 rounded-full bg-white/80 backdrop-blur hover:bg-red-100"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteLink(acc.id);
                                    }}
                                    aria-label="Eliminar alojamiento"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-600 group-hover:text-red-600 transition-colors"
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
                                </div>
                              );
                            })}
                          </div>
                          </div>
                        )}
                      </div>

                      {/* Accommodation suggestions dropdown */}
                      {dest.sugerencias_alojamiento && (
                        <div className="ml-11">
                          <div>
                            {openAccommodationSuggestions[idx] && (
                              <div
                                id={`accommodation-suggestions-${idx}`}
                                className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="text-gray-900 whitespace-pre-line">
                                  {dest.sugerencias_alojamiento}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
