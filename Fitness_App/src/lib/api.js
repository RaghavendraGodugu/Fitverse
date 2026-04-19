const BASE_URL = "https://fitverse-1-lv1o.onrender.com";

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}