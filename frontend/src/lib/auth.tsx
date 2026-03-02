import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api"; // axios instance
import { setAuthToken, getAuthToken } from "@/lib/api";
import API from "@/lib/apiEndpoints";

interface AuthContextType {
  user: any;
  updateUser: (partialUser: Record<string, any>) => void;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  startOAuth: (provider: "google" | "42") => void;
  completeOAuthLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.get(API.users.me)
        .then(setUser)
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post(API.auth.login, {
      identifier: identifier.trim(),
      password,
    });

    setAuthToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (email: string, password: string) => {
    await api.post(API.auth.signup, {
      email: email.trim(),
      password,
    });
    await login(email, password);
  };

  const getAuthBaseUrl = () => {
    const configuredBase = (api.defaults.baseURL as string | undefined) || "";

    if (!configuredBase) {
      return window.location.origin;
    }

    if (/^https?:\/\//i.test(configuredBase)) {
      return configuredBase;
    }

    const normalizedBase = configuredBase.startsWith("/")
      ? configuredBase
      : `/${configuredBase}`;
    return `${window.location.origin}${normalizedBase}`;
  };

  const startOAuth = (provider: "google" | "42") => {
    const endpoint = provider === "google" ? API.auth.google : API.auth.intra42;
    const redirectUrl = new URL(endpoint, getAuthBaseUrl()).toString();
    window.location.assign(redirectUrl);
  };

  const completeOAuthLogin = async (token: string) => {
    setAuthToken(token);

    try {
      const me = await api.get(API.users.me);
      setUser(me);
      return;
    } catch {
      const fallback = await api.get(API.auth.profile);
      setUser(fallback?.user ?? fallback);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (partialUser: Record<string, any>) => {
    setUser((prev: any) => ({
      ...(prev || {}),
      ...(partialUser || {}),
    }));
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, login, signup, startOAuth, completeOAuthLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
