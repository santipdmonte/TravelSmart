"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
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

  const initialViewState = useMemo(
    () =>
      ({
        longitude: destinationPoints[0]?.coord[0] ?? 0,
        latitude: destinationPoints[0]?.coord[1] ?? 20,
        zoom: destinationPoints.length > 1 ? 2 : 3,
        bearing: 0,
        pitch: 0,
      } as const),
    [destinationPoints]
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

  // Build simple great-circle legs
  const routesGeoJSON = useMemo<FeatureCollection<LineString>>(
    () => ({
      type: "FeatureCollection",
      features: destinationPoints.slice(0, -1).map(
        (item, i): Feature<LineString> => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: greatCircle(
              item.coord,
              destinationPoints[i + 1].coord,
              96
            ),
          },
          properties: { from: item.index, to: destinationPoints[i + 1].index },
        })
      ),
    }),
    [destinationPoints, greatCircle]
  );

  const rawToken =
    process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const token = rawToken && rawToken.startsWith("pk.") ? rawToken : null;

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

  const handleMapLoad = useCallback(
    (e: { target: MbMap }) => {
      try {
        const map = e.target;
        map.setProjection("globe");
        map.setFog({
          range: [0.5, 10],
          color: "rgba(255,255,255,0.25)",
          "horizon-blend": 0.2,
        } as any);
        // Fit bounds to all points with padding when multiple points available
        if (destinationPoints.length >= 2) {
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
      } catch {}
    },
    [destinationPoints]
  );

  return (
    <div className="w-full h-full relative">
      {token ? (
        <Map
          mapboxAccessToken={token}
          initialViewState={initialViewState}
          projection="globe"
          mapStyle="mapbox://styles/luisalberto2003/cmf34lq88002e01s21z3o2ep0"
          interactiveLayerIds={["points-circle"]}
          onClick={onMapClick}
          onLoad={handleMapLoad}
          dragRotate={false}
          style={{ width: "100%", height: "100%" }}
        >
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
            <Layer
              id="arcs-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{
                "line-color": "#0ea5e9",
                "line-width": 2.5,
                "line-opacity": 0.85,
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
        </Map>
      ) : (
        <div className="w-full h-full grid place-items-center text-sm text-neutral-500 p-4 bg-gray-100">
          Configura NEXT_PUBLIC_MAPBOX_API_TOKEN para ver el mapa.
        </div>
      )}
    </div>
  );
}
