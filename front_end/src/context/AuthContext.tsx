import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AuthUser = { id?: number; email?: string; fullName?: string; role?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const sessionText = localStorage.getItem("session");
      const session = sessionText ? (JSON.parse(sessionText) as { currentUser?: AuthUser; token?: string }) : null;
      if (session?.token && session.currentUser) {
        setUser(session.currentUser);
        setToken(session.token);
      }
    } catch {
      localStorage.removeItem("session");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login: (userData, authToken) => {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("session", JSON.stringify({ currentUser: userData, token: authToken }));
    },
    logout: () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("session");
    },
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
