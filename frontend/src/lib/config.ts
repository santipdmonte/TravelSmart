// Centralized API base URLs
// ROOT_BASE_URL is used for routers mounted at the root (e.g., /auth, /users, traveler test routes)
// API_BASE_URL is used for routers mounted under /api (e.g., /api/itineraries, /api/transports)
export const ROOT_BASE_URL =
  process.env.NEXT_PUBLIC_ROOT_BASE_URL || "http://localhost:8001";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const API_BASE_URL = RAW_API_BASE_URL || `${ROOT_BASE_URL}/api`;

// Nice console error when API base URL isn't explicitly configured
let __warnedMissingApiBase = false;
export function __warnMissingApiBaseIfNeeded(opts?: {
  when?: "onLoad" | "onApiCall";
}) {
  if (RAW_API_BASE_URL) return; // nothing to do
  if (__warnedMissingApiBase) return; // log only once

  const context =
    opts?.when === "onApiCall"
      ? "al intentar llamar al backend"
      : "en tiempo de carga";
  const fileHint = "frontend/.env.local"; // path from repo root

  const title = "%cTravelSmart – Configuración faltante";
  const badge =
    "background:#b91c1c;color:#fff;padding:2px 6px;border-radius:4px;font-weight:600";
  const body = [
    "\nNo se encontró la variable de entorno NEXT_PUBLIC_API_BASE_URL ",
    `(${context}).`,
    "\n\nPara solucionarlo, crea o edita el archivo:",
    `\n  ${fileHint}`,
    "\ny agrega esta línea (ejemplo para local):",
    "\n  NEXT_PUBLIC_API_BASE_URL=http://localhost:8001",
    "\n\nLuego reinicia el servidor de desarrollo para aplicar los cambios.",
  ].join("");

  if (typeof window !== "undefined") {
    // Browser console with styling
    console.error(title, badge, body);
  } else {
    // Server-side console (fallback)
    console.error(
      "[TravelSmart] Falta configurar NEXT_PUBLIC_API_BASE_URL. Edita frontend/.env.local y agrega:\n  NEXT_PUBLIC_API_BASE_URL=http://localhost:8001\nReinicia el servidor de desarrollo."
    );
  }
  __warnedMissingApiBase = true;
}
