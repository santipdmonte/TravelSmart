"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/mapbox";
import type { GeoJSONFeature, Map as MbMap } from "mapbox-gl";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { Itinerary } from "@/types/itinerary";

export interface ItineraryMapProps {
  itinerary: Itinerary; // full itinerary object
  hoveredDestinationIndex: number | null; // index of hovered destination (sidebar hover)
}

// Helper to parse destination coordinates: prefer numeric latitude/longitude, fallback to 'coordenadas' string "lat,lng"
function getDestinationLonLat(dest: {
  latitude?: number;
  longitude?: number;
  coordenadas?: string;
}): [number, number] | null {
  if (typeof dest.longitude === "number" && typeof dest.latitude === "number") {
    return [dest.longitude, dest.latitude]; // Mapbox expects [lng, lat]
  }
  if (dest.coordenadas) {
    const parts = dest.coordenadas.split(/[,;]\s*/).map((p) => parseFloat(p));
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
      // Assume stored as "lat,lng" so convert to [lng,lat]
      return [parts[1], parts[0]];
    }
  }
  return null;
}

export default function ItineraryMap({
  itinerary,
  hoveredDestinationIndex,
}: ItineraryMapProps) {
  interface PointFeatureProps {
    id: number;
    city: string;
    days: number;
    order: number;
    hovered: boolean;
  }

  // Minimal fog options type (Mapbox types missing)
  interface FogOptions {
    range?: [number, number];
    color?: string;
    "horizon-blend"?: number;
  }

  // Transport color map (extend when backend adds transport types between destinations)
  // Updated colors: default & walk share neutral gray; previous 8-digit hex removed (Mapbox expects 3/6-digit or rgba)
  const transportColor: Record<string, string> = {
    car: "#ff2a6d",
    walk: "#6b7280", // gray solid (reserved if backend adds walking segments)
    bike: "#0ea5e9",
    train: "#8b5cf6",
    plane: "#f59e0b",
    bus: "#2563eb",
    boat: "#0d9488",
    default: "#6b7280", // gray dotted
  };

  const destinos = useMemo(
    () => itinerary.details_itinerary.destinos || [],
    [itinerary.details_itinerary.destinos]
  );

  // Pre-normalize coordinates (single pass)
  const destinationPoints = useMemo(() => {
    return destinos.reduce<
      {
        d: (typeof destinos)[number];
        coord: [number, number];
        index: number;
      }[]
    >((acc, d, i) => {
      const coord = getDestinationLonLat(d);
      if (coord) acc.push({ d, coord, index: i });
      return acc;
    }, []);
  }, [destinos]);

  const itineraryKey = itinerary.itinerary_id || itinerary.itinerary_id; // stable key
  const STORAGE_KEY = `itinerary_map_view_${itineraryKey}`;
  const styleLoadedRef = useRef(false);
  const [styleReady, setStyleReady] = useState(false); // gate Sources until style is ready
  const skipInitialFitRef = useRef(false);

  // Load persisted view state if any
  const persistedView = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.longitude === "number") return parsed;
    } catch {}
    return null;
  }, [STORAGE_KEY]);

  const initialViewState = useMemo(
    () =>
      ({
        longitude:
          persistedView?.longitude ?? destinationPoints[0]?.coord[0] ?? 0,
        latitude:
          persistedView?.latitude ?? destinationPoints[0]?.coord[1] ?? 20,
        zoom: persistedView?.zoom ?? (destinationPoints.length > 1 ? 2 : 3),
        bearing: persistedView?.bearing ?? 0,
        pitch: persistedView?.pitch ?? 0,
      } as const),
    [persistedView, destinationPoints]
  );

  // Great-circle interpolation between two lon/lat points
  const greatCircle = useCallback(
    (
      from: [number, number],
      to: [number, number],
      steps = 64
    ): [number, number][] => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const toDeg = (r: number) => (r * 180) / Math.PI;
      const [lon1, lat1] = [toRad(from[0]), toRad(from[1])];
      const [lon2, lat2] = [toRad(to[0]), toRad(to[1])];
      const xyz = (lon: number, lat: number) =>
        [
          Math.cos(lat) * Math.cos(lon),
          Math.cos(lat) * Math.sin(lon),
          Math.sin(lat),
        ] as const;
      const a = xyz(lon1, lat1);
      const b = xyz(lon2, lat2);
      const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const omega = Math.acos(Math.min(1, Math.max(-1, dot)));
      if (omega === 0) return [from, to];
      const coords: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const sin_omega = Math.sin(omega);
        const k1 = Math.sin((1 - t) * omega) / sin_omega;
        const k2 = Math.sin(t * omega) / sin_omega;
        const x = k1 * a[0] + k2 * b[0];
        const y = k1 * a[1] + k2 * b[1];
        const z = k1 * a[2] + k2 * b[2];
        const r = Math.sqrt(x * x + y * y + z * z);
        const lon = Math.atan2(y / r, x / r);
        const lat = Math.asin(z / r);
        coords.push([toDeg(lon), toDeg(lat)]);
      }
      return coords;
    },
    []
  );

  const pointsGeoJSON = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: destinationPoints.map((item) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: item.coord },
        properties: {
          id: item.index,
          city: item.d.ciudad,
          days: item.d.dias_en_destino,
          order: item.index + 1,
          hovered: hoveredDestinationIndex === item.index,
        },
      })),
    }),
    [destinationPoints, hoveredDestinationIndex]
  );

  // Build a lookup from backend transport segments (Spanish labels) to internal keys
  const transportLookup = useMemo(() => {
    const map: Record<string, string> = {};
    const segs = itinerary.details_itinerary.transportes_entre_destinos || [];
    const norm = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    const mapType = (t: string): string => {
      switch (t) {
        case "Avión":
          return "plane";
        case "Tren":
          return "train";
        case "Auto":
          return "car";
        case "Colectivo":
          return "bus";
        case "Barco":
          return "boat";
        default:
          return "default";
      }
    };
    for (const s of segs) {
      if (!s.ciudad_origen || !s.ciudad_destino) continue;
      const key = `${norm(s.ciudad_origen)}__${norm(s.ciudad_destino)}`;
      map[key] = mapType(s.tipo_transporte);
    }
    return map;
  }, [itinerary.details_itinerary.transportes_entre_destinos]);

  // Build great-circle legs with real transport data if available
  const routesGeoJSON = useMemo<FeatureCollection<LineString>>(
    () => ({
      type: "FeatureCollection",
      features: destinationPoints
        .slice(0, -1)
        .map((item, i): Feature<LineString> => {
          const next = destinationPoints[i + 1];
          const norm = (s: string) =>
            s
              .trim()
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "");
          const key = `${norm(item.d.ciudad)}__${norm(next.d.ciudad)}`;
          const transport = transportLookup[key] || "default";
          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: greatCircle(item.coord, next.coord, 96),
            },
            properties: {
              from: item.index,
              to: next.index,
              transport,
              hovered:
                hoveredDestinationIndex === item.index ||
                hoveredDestinationIndex === next.index,
            },
          };
        }),
    }),
    [destinationPoints, greatCircle, hoveredDestinationIndex, transportLookup]
  );

  // Resolve Mapbox token from env (client-safe NEXT_PUBLIC_ vars only)
  const rawToken = (
    process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    ""
  )
    .toString()
    .trim()
    // strip accidental quotes if committed in .env.local
    .replace(/^['"]|['"]$/g, "");
  const token = rawToken && rawToken.startsWith("pk.") ? rawToken : null;

  // Helpful warning in dev to avoid confusion when editing .env.local without restart
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !token) {
      console.warn(
        "[TravelSmart] Mapbox token no detectado. Asegúrate de definir NEXT_PUBLIC_MAPBOX_API_TOKEN (o NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) en frontend/.env.local y reinicia `npm run dev`."
      );
    }
  }, [token]);

  const [popup, setPopup] = useState<{
    lngLat: [number, number];
    city: string;
    days: number;
    id: number;
  } | null>(null);

  type ClickEvent = {
    features?: GeoJSONFeature[];
    lngLat: { lng: number; lat: number };
  };
  const onMapClick = useCallback((e: ClickEvent) => {
    const feature = e.features && e.features[0];
    if (feature && feature.properties) {
      const props = feature.properties as unknown as PointFeatureProps;
      setPopup({
        lngLat: [e.lngLat.lng, e.lngLat.lat],
        city: String(props.city),
        days: Number(props.days),
        id: Number(props.id),
      });
    } else {
      setPopup(null);
    }
  }, []);

  // Track map instance for flyTo
  const [mapRef, setMapRef] = useState<MbMap | null>(null);

  // Fly to hovered destination
  useEffect(() => {
    if (!mapRef || hoveredDestinationIndex == null) return;
    const point = destinationPoints.find(
      (p) => p.index === hoveredDestinationIndex
    );
    if (!point) return;
    mapRef.flyTo({
      center: point.coord,
      zoom: Math.max(mapRef.getZoom(), 3.5),
      duration: 900,
    });
  }, [hoveredDestinationIndex, destinationPoints, mapRef]);

  // Persist view on move end
  useEffect(() => {
    if (!mapRef) return;
    const handler = () => {
      if (!styleLoadedRef.current) return;
      const c = mapRef.getCenter();
      const data = {
        longitude: c.lng,
        latitude: c.lat,
        zoom: mapRef.getZoom(),
        bearing: mapRef.getBearing(),
        pitch: mapRef.getPitch(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    };
    mapRef.on("moveend", handler);
    return () => {
      mapRef.off("moveend", handler);
    };
  }, [mapRef, STORAGE_KEY]);

  const handleMapLoad = useCallback(
    (e: { target: MbMap }) => {
      try {
        const map = e.target;
        styleLoadedRef.current = true;
        setStyleReady(true);
        map.setProjection("globe");
        map.setFog({
          range: [0.5, 10],
          color: "rgba(255,255,255,0.25)",
          "horizon-blend": 0.2,
        } as FogOptions);
        // Fit bounds only if no persisted view and multiple points
        if (!skipInitialFitRef.current && destinationPoints.length >= 2) {
          const lons = destinationPoints.map((p) => p.coord[0]);
          const lats = destinationPoints.map((p) => p.coord[1]);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          map.fitBounds(
            [
              [minLon, minLat],
              [maxLon, maxLat],
            ],
            { padding: 60, duration: 800 }
          );
        }
        setMapRef(map);
      } catch {}
    },
    [destinationPoints]
  );

  // Extra safety: if style reloads (styledata) or coming from a transient state
  useEffect(() => {
    if (!mapRef) return;
    const ensureReady = () => {
      if (mapRef.isStyleLoaded()) {
        styleLoadedRef.current = true;
        setStyleReady(true);
      }
    };
    // Sometimes styledata fires multiple times; keep it lightweight
    mapRef.on("styledata", ensureReady);
    // Immediate check (in case onLoad already fired before effect ran)
    ensureReady();
    return () => {
      mapRef.off("styledata", ensureReady);
    };
  }, [mapRef]);

  return (
    <div className="w-full h-full relative">
      {token ? (
        <Map
          mapboxAccessToken={token}
          initialViewState={initialViewState}
          projection="globe"
          mapStyle="mapbox://styles/luisalberto2003/cmf34lq88002e01s21z3o2ep0"
          interactiveLayerIds={styleReady ? ["points-circle"] : []}
          onClick={onMapClick}
          onLoad={handleMapLoad}
          dragRotate={false}
          style={{ width: "100%", height: "100%" }}
        >
          {styleReady && (
            <>
              <Source id="points" type="geojson" data={pointsGeoJSON}>
                <Layer
                  id="points-shadow"
                  type="circle"
                  paint={{
                    "circle-radius": ["case", ["get", "hovered"], 14, 11],
                    "circle-color": "#000",
                    "circle-opacity": 0.12,
                    "circle-blur": 0.4,
                    "circle-translate": [0, 1],
                    "circle-translate-anchor": "viewport",
                  }}
                />
                <Layer
                  id="points-glow"
                  type="circle"
                  paint={{
                    "circle-radius": ["case", ["get", "hovered"], 18, 14],
                    "circle-color": "#0284c7",
                    "circle-opacity": 0.12,
                  }}
                />
                <Layer
                  id="points-circle"
                  type="circle"
                  paint={{
                    "circle-radius": ["case", ["get", "hovered"], 13, 10],
                    "circle-color": "#ffffff",
                    "circle-stroke-color": [
                      "case",
                      ["get", "hovered"],
                      "#0284c7",
                      "#E5E7EB",
                    ],
                    "circle-stroke-width": ["case", ["get", "hovered"], 3, 1.5],
                  }}
                />
                <Layer
                  id="points-labels"
                  type="symbol"
                  layout={{
                    "text-field": ["to-string", ["get", "order"]],
                    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                    "text-size": 12,
                    "text-offset": [0, 0],
                    "text-anchor": "center",
                    "text-allow-overlap": true,
                    "text-ignore-placement": true,
                  }}
                  paint={{
                    "text-color": "#0284c7",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 2,
                    "text-halo-blur": 0.6,
                  }}
                />
              </Source>

              <Source id="arcs" type="geojson" data={routesGeoJSON}>
                {/* Default (unknown) transport: gray dotted */}
                <Layer
                  id="arcs-line-default"
                  type="line"
                  filter={["==", "transport", "default"]}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": transportColor.default,
                    "line-width": 2.5,
                    "line-opacity": 0.7,
                    "line-dasharray": [2, 2],
                  }}
                />
                {/* Walk transport: same gray, solid */}
                <Layer
                  id="arcs-line-walk"
                  type="line"
                  filter={["==", "transport", "walk"]}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": transportColor.walk,
                    "line-width": 2.5,
                    "line-opacity": 0.7,
                  }}
                />
                {/* Other transports retain color mapping, solid */}
                <Layer
                  id="arcs-line-other"
                  type="line"
                  // Exclude default & walk (handled by previous layers). Legacy filter syntax uses property name directly.
                  filter={["all", ["!in", "transport", "default", "walk"]]}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": [
                      "match",
                      ["get", "transport"],
                      "car",
                      transportColor.car,
                      "bike",
                      transportColor.bike,
                      "train",
                      transportColor.train,
                      "plane",
                      transportColor.plane,
                      "bus",
                      transportColor.bus,
                      "boat",
                      transportColor.boat,
                      transportColor.default,
                    ],
                    "line-width": 2.5,
                    "line-opacity": 0.7,
                  }}
                />
                {/* Hover highlight (solid, above others) */}
                <Layer
                  id="arcs-line-hover"
                  type="line"
                  filter={["==", "hovered", true]}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": [
                      "match",
                      ["get", "transport"],
                      "car",
                      transportColor.car,
                      "walk",
                      transportColor.walk,
                      "bike",
                      transportColor.bike,
                      "train",
                      transportColor.train,
                      "plane",
                      transportColor.plane,
                      "bus",
                      transportColor.bus,
                      "boat",
                      transportColor.boat,
                      transportColor.default,
                    ],
                    "line-width": 4.5,
                    "line-opacity": 0.95,
                    "line-blur": 0.2,
                  }}
                />
              </Source>

              {popup && (
                <Popup
                  longitude={popup.lngLat[0]}
                  latitude={popup.lngLat[1]}
                  anchor="bottom-left"
                  closeOnClick={false}
                  onClose={() => setPopup(null)}
                  offset={8}
                  className="!p-0 !bg-transparent !shadow-none"
                >
                  <div className="rounded bg-black/80 text-white text-xs shadow p-2">
                    <div className="font-semibold">{popup.city}</div>
                    <div className="text-neutral-300">Días: {popup.days}</div>
                  </div>
                </Popup>
              )}
            </>
          )}
        </Map>
      ) : (
        <div className="w-full h-full grid place-items-center text-sm text-neutral-500 p-4 bg-gray-100">
          Configura NEXT_PUBLIC_MAPBOX_API_TOKEN (o
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) en frontend/.env.local y reinicia el
          servidor para ver el mapa.
        </div>
      )}
    </div>
  );
}
