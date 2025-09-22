"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/mapbox";
import type { Map as MbMap } from "mapbox-gl";

interface FogOptions {
  range?: [number, number];
  color?: string;
  "horizon-blend"?: number;
}

export default function PlainMap() {
  const STORAGE_KEY = "dashboard_plain_map_view";
  const styleLoadedRef = useRef(false);
  const [mapRef, setMapRef] = useState<MbMap | null>(null);
  const [styleReady, setStyleReady] = useState(false);

  // Resolve token (reuse logic from itinerary map)
  const rawToken = (
    process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    ""
  )
    .toString()
    .trim()
    .replace(/^['"]|['"]$/g, "");
  const token = rawToken && rawToken.startsWith("pk.") ? rawToken : null;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !token) {
      console.warn(
        "[TravelSmart] Mapbox token no detectado. Define NEXT_PUBLIC_MAPBOX_API_TOKEN (o NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) en frontend/.env.local."
      );
    }
  }, [token]);

  // Load persisted view state
  const initialViewState = useMemo(
    () => {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.longitude === "number") {
              return parsed;
            }
          }
        } catch {}
      }
      return {
        longitude: 0,
        latitude: 20,
        zoom: 2,
        bearing: 0,
        pitch: 0,
      } as const;
    },
    []
  );

  // Persist view on moveend
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
  }, [mapRef]);

  const handleMapLoad = (e: { target: MbMap }) => {
    const map = e.target;
    styleLoadedRef.current = true;
    setStyleReady(true);
    map.setProjection("globe");
    map.setFog({
      range: [0.5, 10],
      color: "rgba(255,255,255,0.25)",
      "horizon-blend": 0.2,
    } as FogOptions);
    setMapRef(map);
  };

  return (
    <div className="w-full h-full">
      {token ? (
        <Map
          mapboxAccessToken={token}
          initialViewState={initialViewState}
          projection="globe"
          mapStyle="mapbox://styles/luisalberto2003/cmf34lq88002e01s21z3o2ep0"
          attributionControl={false}
          onLoad={handleMapLoad}
          dragRotate={false}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Mock visited countries highlight */}
          {styleReady && (
            <Source id="country-boundaries" type="vector" url="mapbox://mapbox.country-boundaries-v1">
              {/* Soft fill for visited countries */}
              <Layer
                id="visited-fill"
                type="fill"
                source-layer="country_boundaries"
                filter={["in", ["get", "iso_3166_1_alpha_3"], ["literal", ["ARG", "URY", "CHL", "ABW", "MEX", "BRA", "USA", "ESP", "FRA", "NLD", "ITA", "GBR", "IRL", "BEL"]                ]]}
                paint={{
                  "fill-color": "#0ea5e9",
                  "fill-opacity": 0.18,
                }}
              />
              {/* Subtle outline + blur for glow effect */}
              <Layer
                id="visited-outline"
                type="line"
                source-layer="country_boundaries"
                filter={["in", ["get", "iso_3166_1_alpha_3"], ["literal", ["ARG", "URY", "CHL", "ABW", "MEX", "BRA", "USA", "ESP", "FRA", "NLD", "ITA", "GBR", "IRL", "BEL"]]]}
                paint={{
                  "line-color": "#0ea5e9",
                  "line-width": 1.5,
                  "line-opacity": 0.6,
                  "line-blur": 0.5,
                }}
              />
            </Source>
          )}
        </Map>
      ) : (
        <div className="w-full h-full grid place-items-center text-sm text-neutral-500 p-4 bg-gray-100 rounded-2xl">
          Configura NEXT_PUBLIC_MAPBOX_API_TOKEN para ver el mapa.
        </div>
      )}
    </div>
  );
}


