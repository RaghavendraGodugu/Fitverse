// Uses VITE_API_URL if set (like in Vercel/Netlify), otherwise defaults to local proxy targeting port 5001
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  // If in development mode AND VITE_API_URL is pointing to a cloud server, override it to hit local backend
  // so local API key testing works seamlessly
  if (import.meta.env.DEV) {
    return 'http://localhost:5001';
  }
  if (raw == null || String(raw).trim() === '') return '';
  return String(raw).replace(/\/+$/, '');
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}