"use client";

import {
  clearStoredUser,
  persistUser,
  readStoredUser,
} from "@/lib/auth/storage";
import { authenticateUser } from "@/lib/auth/session";
import type { LoginPayload, User } from "@/types/auth";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialAuthState(): { user: User | null; isReady: boolean } {
  if (typeof window === "undefined") {
    return { user: null, isReady: false };
  }
  return { user: readStoredUser(), isReady: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const { user, isReady } = authState;

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = await authenticateUser(payload);
    persistUser(loggedIn);
    setAuthState({ user: loggedIn, isReady: true });
  }, []);

  const logout = useCallback(async () => {
    await clearStoredUser();
    setAuthState({ user: null, isReady: true });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isReady,
      isAdmin: Boolean(user?.isAdmin),
      login,
      logout,
    }),
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
