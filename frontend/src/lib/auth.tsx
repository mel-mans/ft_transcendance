import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken as apiSetAuthToken, getAuthToken as apiGetAuthToken } from './api';
import { UserProfile, setCurrentUser as storeCurrentUser, getCurrentUser } from './matching';

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = apiGetAuthToken();
      if (token) {
        try {
          const apiUser = await api.fetchCurrentUser();
          if (apiUser) {
            setUser(apiUser);
            storeCurrentUser(apiUser);
          } else {
            // fallback to local
            const local = getCurrentUser();
            setUser(local);
          }
        } catch (err) {
          const local = getCurrentUser();
          setUser(local);
        }
      } else {
        const local = getCurrentUser();
        setUser(local);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res && res.access_token) {
        apiSetAuthToken(res.access_token);
        if (res.user) {
          setUser(res.user);
          storeCurrentUser(res.user);
        }
        return res;
      }
      throw new Error('Invalid login response');
    } catch (err: any) {
      // rethrow for callers to handle UI
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiSetAuthToken('');
    localStorage.removeItem('auth_token');
    // clear stored user
    setUser(null);
    // remove current user local storage key
    try { localStorage.removeItem('42roommates_current_user'); } catch (e) {}
    // reload to clear any protected state
    window.location.href = '/';
  };

  const refresh = async () => {
    const apiUser = await api.fetchCurrentUser();
    if (apiUser) {
      setUser(apiUser);
      storeCurrentUser(apiUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
