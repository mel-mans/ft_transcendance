import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api"; // axios instance
import { setAuthToken, getAuthToken } from "@/lib/api";

interface AuthContextType {
  user: any;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.get("/users/me")
        .then(setUser)
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post("/auth/login", {
      email: identifier, // if backend only accepts email
      password,
    });

    setAuthToken(res.data.access_token);
    setUser(res.data.user);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}