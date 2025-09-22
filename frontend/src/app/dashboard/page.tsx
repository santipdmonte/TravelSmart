"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useItinerary } from "@/contexts/ItineraryContext";
import { useItineraryActions } from "@/hooks/useItineraryActions";
import { Button, Input } from "@/components";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import PlainMap from "@/components/itinerary/PlainMap";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { getTravelerTypeDetails } from "@/lib/travelerTestApi";
import type { TravelerType } from "@/types/travelerTest";
import { PlusIcon } from "lucide-react";

export default function DashboardPage() {
  const { state: authState } = useAuth();
  const { itineraries, loading } = useItinerary();
  const { fetchAllItineraries } = useItineraryActions();
  const [resolvedTravelerType, setResolvedTravelerType] = useState<TravelerType | null>(null);
  const [loadingTravelerType, setLoadingTravelerType] = useState<boolean>(true);
  const [openVisitedDialog, setOpenVisitedDialog] = useState(false);
  const [countryNameByCode, setCountryNameByCode] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [visitedLocal, setVisitedLocal] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const originalVisitedRef = useState<string[]>([])[0];

  useEffect(() => {
    fetchAllItineraries();
  }, [fetchAllItineraries]);

  const user = authState.user;
  const isInitialized = Boolean(authState.isInitialized);
  const isLoading = authState.isLoading || loading;

  useEffect(() => {
    let active = true;
    const resolveTravelerType = async () => {
      if (!user) {
        if (active) {
          setResolvedTravelerType(null);
          setLoadingTravelerType(false);
        }
        return;
      }
      if (user.traveler_type) {
        if (active) {
          setResolvedTravelerType(user.traveler_type);
          setLoadingTravelerType(false);
        }
        return;
      }
      if (user.traveler_type_id) {
        try {
          setLoadingTravelerType(true);
          const resp = await getTravelerTypeDetails(user.traveler_type_id);
          if (active) setResolvedTravelerType(resp.data ?? null);
        } finally {
          if (active) setLoadingTravelerType(false);
        }
        return;
      }
      if (active) {
        setResolvedTravelerType(null);
        setLoadingTravelerType(false);
      }
    };
    resolveTravelerType();
    return () => {
      active = false;
    };
  }, [user]);

  const recentItins = itineraries
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Load countries list from public JSON and build code -> name map
  useEffect(() => {
    let alive = true;
    const loadCountries = async () => {
      try {
        const res = await fetch("/countries_list/countries.json");
        const items = (await res.json()) as { code: string; name: string }[];
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const c of items) map[c.code] = c.name;
        setCountryNameByCode(map);
        setCountries(items);
      } catch {}
    };
    loadCountries();
    return () => {
      alive = false;
    };
  }, []);

  // Initialize local visited list when opening dialog
  useEffect(() => {
    if (!openVisitedDialog) return;
    const base = (authState.user?.visited_countries ?? []).slice();
    setVisitedLocal(base);
    // store original snapshot for dirty check
    (originalVisitedRef as any).current = base;
    setSearchValue("");
    setSuggestions([]);
  }, [openVisitedDialog, authState.user?.visited_countries]);

  const isDirty = (() => {
    const a = (visitedLocal || []).slice().sort();
    const b = ((originalVisitedRef as any).current || []).slice().sort();
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
    return false;
  })();

  // Compute suggestions based on search value
  useEffect(() => {
    const q = searchValue.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    const nq = norm(q);
    const existing = new Set(visitedLocal);
    const filtered = countries
      .filter((c) => !existing.has(c.code))
      .filter((c) => norm(c.name).includes(nq) || c.code.toLowerCase().startsWith(nq))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [searchValue, countries, visitedLocal]);

  const addCountry = (code: string) => {
    setVisitedLocal((prev) => (prev.includes(code) ? prev : [...prev, code]));
    setSearchValue("");
    setSuggestions([]);
  };

  const removeCountry = (code: string) => {
    setVisitedLocal((prev) => prev.filter((c) => c !== code));
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 pl-3">Inicio</h1>
            <Button asChild className="bg-sky-500 hover:bg-sky-700 rounded-full px-6">
              <Link href="/create">Crear nuevo itinerario</Link>
            </Button>
          </div>

          {/* Bento grid - Row 1 (map spans two rows to match left stack) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-6 mb-6 items-stretch">
            {/* User summary card (row 1) */}
            <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full lg:col-span-1 lg:row-span-1">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Tu perfil</CardTitle>
              </CardHeader>
              <CardContent>
                  {!isInitialized || isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2">
                        <div className="text-2xl font-semibold text-gray-900">
                          {user?.display_name || user?.first_name || user?.email}
                        </div>
                        <div className="text-gray-600">
                          {user?.city ? `${user.city}${user.country ? ", " + user.country : ""}` : user?.country || ""}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-gray-100 p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{user?.total_trips_created ?? 0}</div>
                          <div className="text-xs text-gray-500">Itinerarios</div>
                        </div>
                        <div className="rounded-2xl border border-gray-100 p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{user?.countries_visited?.length ?? 0}</div>
                          <div className="text-xs text-gray-500">Países</div>
                        </div>
                        <div className="rounded-2xl border border-gray-100 p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{user?.languages_spoken?.length ?? 0}</div>
                          <div className="text-xs text-gray-500">Idiomas</div>
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Traveler type card (row 2) */}
            <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full lg:col-span-1 lg:row-span-1 lg:row-start-2">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Tipo de viajero</CardTitle>
              </CardHeader>
              <CardContent>
                  {loadingTravelerType ? (
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : resolvedTravelerType ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-gray-900">{resolvedTravelerType.name}</div>
                      {resolvedTravelerType.description ? (
                        <p className="text-sm text-gray-700">{resolvedTravelerType.description}</p>
                      ) : (
                        <p className="text-sm text-gray-600">Sin descripción disponible.</p>
                      )}
                      <div className="pt-2">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href="/traveler-type">Ver detalles</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">Aún no tienes un tipo de viajero asignado.</p>
                      <p className="text-sm text-gray-600">Realiza el test para descubrir tu perfil y obtener recomendaciones más personalizadas.</p>
                      <div className="pt-2">
                        <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-700">
                          <Link href="/traveler-test">Realizar test de viajero</Link>
                        </Button>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Map mockup card */}
            <div className="lg:col-span-2 lg:row-span-2">
              <Card className="bg-white rounded-3xl shadow-xl border-none overflow-hidden h-full p-0 h-full">
                <CardContent className="h-full p-0 relative">
                  {/* Map fills entire card */}
                  <div className="h-full min-h-64 md:min-h-[26rem]">
                    <PlainMap />
                  </div>
                  {/* Overlay header + action */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <Button 
                        variant="outline"
                        className="pointer-events-auto rounded-full bg-white/90 text-gray-900 border shadow px-3 py-1 text-sm"
                        onClick={() => {}}
                    >
                            
                      Países visitados
                    </Button>
                    <Button
                      variant="outline"
                      className="pointer-events-auto rounded-full bg-white/90"
                      onClick={() => setOpenVisitedDialog(true)}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Agregar países
                    </Button>
                  </div>
                  {/* Dialog: Add visited countries (mock UI) */}
                  <Dialog
                    open={openVisitedDialog}
                    onOpenChange={(next) => {
                      if (next) {
                        setOpenVisitedDialog(true);
                      } else {
                        if (isDirty) setShowUnsavedConfirm(true);
                        else setOpenVisitedDialog(false);
                      }
                    }}
                  >
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Países visitados</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            placeholder="Agregar país (ej: Argentina, España)"
                            className="rounded-full"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          {suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-auto max-h-64">
                              {suggestions.map((s) => (
                                <button
                                  key={`sugg-${s.code}`}
                                  type="button"
                                  onClick={() => addCountry(s.code)}
                                  className="w-full text-left px-4 py-2 hover:bg-sky-50 flex items-center justify-between"
                                >
                                  <span>{s.name}</span>
                                  <span className="text-xs text-gray-500">{s.code}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Ya agregados</div>
                          <div className="flex flex-wrap gap-2">
                            {(visitedLocal ?? []).map((code) => (
                              <span
                                key={`country-chip-${code}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm border transition-colors shadow-sm bg-white text-gray-700 border-gray-200"
                              >
                                {countryNameByCode[code] ?? code}
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-gray-100"
                                  aria-label={`Quitar ${code}`}
                                  onClick={() => removeCountry(code)}
                                >
                                  <XIcon className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            className="rounded-full bg-sky-500 hover:bg-sky-700"
                            disabled={!isDirty}
                            onClick={() => {
                              // A futuro persistiremos en backend. Ahora solo cerramos.
                              setOpenVisitedDialog(false);
                            }}
                          >
                            Guardar cambios
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Unsaved changes confirmation */}
                  <Dialog open={showUnsavedConfirm} onOpenChange={setShowUnsavedConfirm}>
                    <DialogContent className="sm:max-w-[440px]">
                      <DialogHeader>
                        <DialogTitle>Hay cambios sin guardar</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-gray-600 mb-4">
                        ¿Quieres cerrar sin guardar los cambios o guardarlos ahora?
                      </p>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setShowUnsavedConfirm(false);
                            setOpenVisitedDialog(false); // descartar
                          }}
                        >
                          Cerrar sin guardar
                        </Button>
                        <Button
                          className="rounded-full bg-sky-500 hover:bg-sky-700"
                          onClick={() => {
                            setShowUnsavedConfirm(false);
                            setOpenVisitedDialog(false);
                          }}
                        >
                          Guardar y cerrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bento grid - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent itineraries list (span 2 cols) */}
            <div className="lg:col-span-2">
              <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900">Tus itinerarios recientes</CardTitle>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/itineraries">Ver todos</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                    </div>
                  ) : recentItins.length === 0 ? (
                    <div className="text-sm text-gray-600">No hay itinerarios aún. ¡Crea tu primer itinerario!</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {recentItins.map((it) => (
                        <Link key={it.itinerary_id} href={`/itinerary/${it.itinerary_id}`} className="group">
                          <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-base font-semibold text-gray-900 group-hover:text-sky-600">
                                  {it.trip_name}
                                </div>
                                <div className="text-sm text-gray-600">{it.destination || it.trip_name}</div>
                              </div>
                              <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
                                {it.duration_days} días
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Creado el {new Date(it.created_at).toLocaleDateString()}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick actions (right side) */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Acciones rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild className="w-full rounded-full bg-sky-500 hover:bg-sky-700">
                      <Link href="/create">Crear itinerario</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full">
                      <Link href="/traveler-test">Descubrir mi perfil viajero</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


