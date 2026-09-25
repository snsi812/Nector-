import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, login as apiLogin, register as apiRegister, type Goal, type User } from "../api/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, goal: Goal, weightKg?: number) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nector_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("nector_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await apiLogin({ email, password });
    localStorage.setItem("nector_token", token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, goal: Goal, weightKg?: number) => {
      const { token, user } = await apiRegister({ name, email, password, goal, weightKg });
      localStorage.setItem("nector_token", token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("nector_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
