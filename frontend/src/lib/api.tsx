import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import API from "./apiEndpoints";

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
  // Endpoints already include `/api/...`, so strip a trailing `/api` from base URL if provided.
  baseURL: (() => {
    const rawBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();

    if (!rawBase) {
      // When frontend is served directly (3003/8080), route API calls through nginx gateway.
      if (
        typeof window !== "undefined" &&
        ["3003", "8080"].includes(window.location.port)
      ) {
        return "https://localhost";
      }
      return undefined;
    }

    return rawBase.replace(/\/+$/, "").replace(/\/api$/, "");
  })(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
}) as ApiClient;

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
    user: any;
  }>(API.auth.login, credentials);
}

export async function signup(payload: Record<string, any>) {
  return axiosInstance.post<{
    message: string;
    user: any;
  }>(API.auth.signup, payload);
}

export async function logout() {
  return axiosInstance.post<{ message: string }>(API.auth.logout);
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
  logout,
  fetchCurrentUser,
  completeUserProfile,
};

export const api = axiosInstance;
