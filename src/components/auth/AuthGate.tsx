"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const PUBLIC_PATHS = ["/login"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!mounted || !isReady) return;

    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, isReady, isPublic, pathname, router, mounted]);

  if (!mounted || !isReady) {
    return <>{children}</>;
  }

  if (!user && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
