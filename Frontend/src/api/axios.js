import axios from "axios";

/**
 * One configured Axios instance for the whole app.
 * Never call axios directly from a component — import this instead,
 * or better, import a service from src/services/.
 */

export const AUTH_STORAGE_KEY = "mfp_auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/** Reads the saved session ({ token, user }) from localStorage. */
export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/* ---------- Request: attach the JWT ---------- */
api.interceptors.request.use((config) => {
  const session = readStoredAuth();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

/* ---------- Response: handle an expired / invalid token ---------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // A 401 from /api/auth/login just means "wrong email or password" —
    // let the login form show that. Any other 401 means the session is
    // no longer valid, so drop it and send the user back to login.
    const isAuthRoute = url.includes("/api/auth/");

    if (status === 401 && !isAuthRoute) {
      clearStoredAuth();
      if (window.location.pathname !== "/login") {
        window.location.replace("/login?expired=1");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
