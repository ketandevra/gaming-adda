"use client";

import { useAuth } from "@/contexts/AuthContext";
import { normalizeMobile } from "@/lib/auth/mobile";
import { useMemo } from "react";

export function useAuthMobile(): string {
  const { user } = useAuth();
  return useMemo(() => normalizeMobile(user?.mobile), [user?.mobile]);
}
