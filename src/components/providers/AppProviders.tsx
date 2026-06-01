"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
