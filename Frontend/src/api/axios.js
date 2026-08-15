import axios from "axios";

export const AUTH_STORAGE_KEY = "mfp_auth";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export function readStoredAuth() {
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Failed to read stored authentication:",
      error
    );

    return null;
  }
}

export function storeAuth(session) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export function clearStoredAuth() {
  localStorage.removeItem(
    AUTH_STORAGE_KEY
  );
}

// =========================================================
// REQUEST INTERCEPTOR
// Attach JWT to protected backend requests
// =========================================================
api.interceptors.request.use(
  (config) => {
    const session =
      readStoredAuth();

    if (session?.token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${session.token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR
// Remove invalid / expired sessions
// =========================================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    const authRequest =
      requestUrl.includes(
        "/api/auth/"
      );

    if (
      status === 401 &&
      !authRequest
    ) {
      clearStoredAuth();

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.replace(
          "/login?expired=1"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;