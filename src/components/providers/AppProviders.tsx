"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AdminGate } from "@/components/auth/AdminGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { ReactNode } from "react";
import { Suspense } from "react";

function AuthGateFallback() {
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<AuthGateFallback />}>
          <AuthGate>
            <AdminGate>{children}</AdminGate>
          </AuthGate>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
