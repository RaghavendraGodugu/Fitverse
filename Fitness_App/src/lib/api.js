/**
 * Production: set VITE_API_URL (e.g. https://api.yourapp.com).
 * Development: leave unset so requests go to the same origin and Vite proxies /api → backend.
 */
export function getApiBaseUrl() {
  return "https://fitverse-1-lv1o.onrender.com";
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `https://fitverse-1-lv1o.onrender.com${p}`;
}