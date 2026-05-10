import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api"; // axios instance
import API from "@/lib/apiEndpoints";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  updateUser: (partialUser: Record<string, any>) => void;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  startOAuth: (provider: "google" | "42") => void;
  completeOAuthLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get(API.users.me)
      .then((userData) => {
        console.log('✅ Auth check successful:', userData);
        setUser(userData);
      })
      .catch((error) => {
        console.log('ℹ️ Auth check failed (expected if not logged in):', error?.message);
        setUser(null);
      })
      .finally(() => {
        console.log('✅ Auth check complete, isLoading set to false');
        setIsLoading(false);
      });
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post(API.auth.login, {
      identifier: identifier.trim(),
      password,
    });

    setUser(res.user);
  };

  const signup = async (email: string, password: string) => {
    const res = await api.post(API.auth.signup, {
      email: email.trim(),
      password,
    });
    setUser(res.user);
  };

  const getAuthBaseUrl = () => {
    // Priority 1: Dedicated auth service URL
    const authServiceUrl = String(import.meta.env.VITE_AUTH_SERVICE_URL || "").trim();
    if (authServiceUrl) {
      const cleanedUrl = authServiceUrl.replace(/\/+$/, "").replace(/\/api$/, "");
      console.log('🔐 Using VITE_AUTH_SERVICE_URL:', cleanedUrl);
      return cleanedUrl;
    }

    // Priority 2: General API base URL (for gateway setup)
    const configuredBase = String(import.meta.env.VITE_API_BASE_URL || "").trim();
    const rawEnvValue = import.meta.env.VITE_API_BASE_URL;

    if (configuredBase) {
      // Remove trailing slashes and /api suffix (endpoints already include /api)
      const cleanedUrl = configuredBase.replace(/\/+$/, "").replace(/\/api$/, "");
      console.log('🔐 Using VITE_API_BASE_URL:', cleanedUrl);
      return cleanedUrl;
    }

    console.warn('⚠️ VITE_AUTH_SERVICE_URL and VITE_API_BASE_URL not configured. Raw env value:', rawEnvValue);

    // Priority 3: Fallback for dev mode
    if (
      typeof window !== "undefined" &&
      ["3003", "8080"].includes(window.location.port)
    ) {
      console.log('🔐 Using localhost fallback (dev mode on port 3003/8080)');
      return "https://localhost";
    }

    // Final fallback: use current origin (NOT RECOMMENDED for production multi-service setup)
    console.warn('⚠️ Falling back to current origin. For Railway, set VITE_AUTH_SERVICE_URL environment variable.');
    return window.location.origin;
  };

  const startOAuth = (provider: "google" | "42") => {
    const endpoint = provider === "google" ? API.auth.google : API.auth.intra42;
    const baseUrl = getAuthBaseUrl();
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const redirectUrl = new URL(endpoint, baseUrl);
    redirectUrl.searchParams.append("callback", callbackUrl);
    const fullUrl = redirectUrl.toString();
    console.log(`🔐 OAuth redirect [${provider}]:`, fullUrl);
    window.location.assign(fullUrl);
  };

  const completeOAuthLogin = async () => {
    const me = await api.get(API.users.me);
    setUser(me);
  };

  const logout = async () => {
    await api.post(API.auth.logout);
    setUser(null);
  };

  const updateUser = (partialUser: Record<string, any>) => {
    setUser((prev: any) => ({
      ...(prev || {}),
      ...(partialUser || {}),
    }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser, login, signup, startOAuth, completeOAuthLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
