"use client";

import {
  clearStoredUser,
  getStoredUserSync,
  setStoredUser,
} from "@/lib/auth/storage";
import { sheetsLogin } from "@/lib/api/sheets-auth";
import type { LoginPayload, User } from "@/types/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUserSync());
    setIsReady(true);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = await sheetsLogin(payload);
    await setStoredUser(loggedIn);
    setUser(loggedIn);
  }, []);

  const logout = useCallback(async () => {
    await clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout }),
    [user, isReady, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
