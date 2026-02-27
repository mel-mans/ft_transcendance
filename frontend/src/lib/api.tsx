import axios from "axios";
import API from "./apiEndpoints";

export const AUTH_TOKEN_KEY = "auth_token";

/* ================================
   TOKEN HELPERS
================================ */

export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/* ================================
   AXIOS INSTANCE
================================ */

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. https://localhost/api
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   REQUEST INTERCEPTOR
================================ */

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================================
   RESPONSE INTERCEPTOR
================================ */

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message;

      // Auto logout on 401
      if (error.response.status === 401) {
        setAuthToken(null);
        window.location.href = "/login";
      }

      const err: any = new Error(message);
      err.status = error.response.status;
      err.data = error.response.data;
      return Promise.reject(err);
    }

    // Network error
    return Promise.reject(
      new Error("Network error: Unable to reach backend.")
    );
  }
);

/* ================================
   AUTH FUNCTIONS
================================ */

export async function login(credentials: {
  email: string;
  password: string;
}) {
  return axiosInstance.post<{
    message: string;
    access_token: string;
    user: any;
  }>(API.auth.login, credentials);
}

export async function signup(payload: Record<string, any>) {
  return axiosInstance.post(API.auth.signup, payload);
}

export async function fetchCurrentUser() {
  try {
    return await axiosInstance.get(API.users.me);
  } catch {
    try {
      return await axiosInstance.get(API.auth.profile);
    } catch {
      return null;
    }
  }
}

/* ================================
   EXPORT
================================ */

export default {
  login,
  signup,
  setAuthToken,
  getAuthToken,
  fetchCurrentUser,
  clearAuth: () => setAuthToken(null),
};

export const api = axiosInstance;