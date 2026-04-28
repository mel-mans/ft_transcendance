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
    return null;
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

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post<{ message: string; avatar: string; user: any }>(
    API.users.avatar,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );
}

export async function deleteAvatar() {
  return axiosInstance.delete<{ message: string; user: any }>(API.users.avatar);
}

export interface ChatMessageDto {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatInboxItemDto {
  senderId: number;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface CreateListingPayload {
  title: string;
  location: string;
  price: number;
  currency: string;
  availableDate: string;
  spotsTotal: number;
  spotsFilled: number;
  description: string;
  hasWifi: boolean;
  hasKitchen: boolean;
  hasLaundry: boolean;
  hasMetroNearby: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  petsOK: boolean;
  hasGym: boolean;
  hasAC: boolean;
  isSecure: boolean;
}

export interface ListingDto {
  id: number;
  userId: number;
  title: string;
  location: string;
  price: number;
  currency: string;
  availableDate: string;
  spotsTotal: number;
  spotsFilled: number;
  description: string;
  images: string[];
  hasWifi: boolean;
  hasKitchen: boolean;
  hasLaundry: boolean;
  hasMetroNearby: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  petsOK: boolean;
  hasGym: boolean;
  hasAC: boolean;
  isSecure: boolean;
  user?: {
    id: number;
    username?: string | null;
    name?: string | null;
    avatar?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingRecommendationsResponse {
  recommendation?: ListingDto | null;
  aiScore?: number;
  algorithm?: "content_fallback" | "online_ml" | "collaborative" | string;
  exploration?: boolean;
  allListings?: ListingDto[];
  recommendations?: ListingDto[];
  message?: string;
}

export interface GenerateBioPayload {
  hobbies: string;
  personality: string;
  lifestyle?: string;
  looking_for?: string;
}

export interface GenerateBioResponse {
  bio: string;
  length: number;
  generated_at: string;
}

export async function createListing(payload: CreateListingPayload) {
  return axiosInstance.post<{ message: string; listing: ListingDto }>(
    API.listings.root,
    payload
  );
}

export async function fetchMyListings() {
  return axiosInstance.get<ListingDto[]>(API.listings.myListings);
}

export async function fetchAllListings() {
  return axiosInstance.get<ListingDto[]>(API.listings.all);
}

export async function fetchListingRecommendations() {
  return axiosInstance.get<ListingRecommendationsResponse>(
    API.listings.recommendations
  );
}

export async function fetchAllUsers() {
  return axiosInstance.get<any[]>(API.users.all);
}

export async function updateListing(id: number, payload: Partial<CreateListingPayload>) {
  return axiosInstance.patch<{ message: string; listing: ListingDto }>(
    API.listings.byId(id),
    payload
  );
}

export async function deleteListing(id: number) {
  return axiosInstance.delete<{ message: string }>(API.listings.byId(id));
}

export async function uploadListingPhotos(id: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return axiosInstance.post<{ message: string; listing: ListingDto }>(
    API.listings.photos(id),
    formData,
    {
      headers: {
        "Content-Type": undefined, // Let axios set multipart/form-data with boundary
      },
    }
  );
}

export async function fetchChatMessages(withUserId: number) {
  return axiosInstance.get<ChatMessageDto[]>(
    API.chat.messages.withUser(withUserId)
  );
}

export async function sendChatMessage(withUserId: number, content: string) {
  return axiosInstance.post<ChatMessageDto>(
    API.chat.messages.withUser(withUserId),
    { content }
  );
}

export async function fetchChatInbox() {
  return axiosInstance.get<ChatInboxItemDto[]>(API.chat.messages.inbox);
}

export async function markChatThreadRead(withUserId: number) {
  return axiosInstance.post<{ updated: number }>(API.chat.messages.markRead(withUserId));
}

export interface AIUserProfile {
  user_id: number;
  budget_max: number;
  cleanliness: number;
  sleep_schedule: "early_bird" | "night_owl";
  smoker: boolean;
  has_pets: boolean;
}

export interface AIMatchRequest {
  target_user: AIUserProfile;
  candidates: AIUserProfile[];
}

export interface AIMatchResult {
  best_match_id: number;
  confidence_score: number;
  algorithm_used: string;
  exploration: boolean;
}

export async function getAIMatch(request: AIMatchRequest) {
  return axiosInstance.post<AIMatchResult>(API.ai.match, request);
}

export async function generateBioWithAI(userId: number | string, payload: GenerateBioPayload) {
  return axiosInstance.post<GenerateBioResponse>(API.ai.generateBio, payload, {
    headers: {
      "X-User-Id": String(userId),
    },
  });
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
  uploadAvatar,
  deleteAvatar,
  createListing,
  fetchAllUsers,
  fetchMyListings,
  fetchAllListings,
  fetchListingRecommendations,
  updateListing,
  deleteListing,
  uploadListingPhotos,
  fetchChatInbox,
  markChatThreadRead,
  fetchChatMessages,
  sendChatMessage,
  getAIMatch,
  generateBioWithAI,
};

export const api = axiosInstance;
