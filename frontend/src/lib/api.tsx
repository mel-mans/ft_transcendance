import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
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

type ApiClient = Omit<
  AxiosInstance,
  "get" | "delete" | "head" | "options" | "post" | "put" | "patch"
> & {
  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  delete<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
  head<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  options<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. https://localhost/api
  headers: {
    "Content-Type": "application/json",
  },
}) as ApiClient;

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

      // Auto logout on 401 only when a token exists.
      // This prevents redirect loops for guest pages that probe protected endpoints.
      if (error.response.status === 401 && getAuthToken()) {
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
  identifier: string;
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

export interface CompleteProfilePayload {
  username: string;
  name: string;
  age: number;
  sex: "male" | "female" | "other";
  bio: string;
  location: string;
  moveInDate: string;
  budget: number;
  currency: string;
  smoker: boolean;
  quietHours: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
  petFriendly: boolean;
  cooks: boolean;
  gamer: boolean;
  social: boolean;
  studious: boolean;
  clean: boolean;
}

export async function completeUserProfile(payload: CompleteProfilePayload) {
  return axiosInstance.post<{ message: string; user: any }>(
    API.users.completeProfile,
    payload
  );
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
  completeUserProfile,
  clearAuth: () => setAuthToken(null),
};

export const api = axiosInstance;
