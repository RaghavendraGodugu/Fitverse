/**
 * Production: set VITE_API_URL (e.g. https://api.yourapp.com).
 * Development: leave unset so requests go to the same origin and Vite proxies /api → backend.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw == null || String(raw).trim() === '') return '';
  return String(raw).replace(/\/+$/, '');
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}
