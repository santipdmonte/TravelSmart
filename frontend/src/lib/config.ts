// Centralized API base URLs
// ROOT_BASE_URL is used for routers mounted at the root (e.g., /auth, /users, traveler test routes)
// API_BASE_URL is used for routers mounted under /api (e.g., /api/itineraries, /api/transports)
export const ROOT_BASE_URL =
  process.env.NEXT_PUBLIC_ROOT_BASE_URL || "http://localhost:8001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || `${ROOT_BASE_URL}/api`;
