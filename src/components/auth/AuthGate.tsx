"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  isProtectedPath,
  loginPathWithRedirect,
  sanitizeRedirectPath,
} from "@/lib/auth/paths";
import { useHasMounted } from "@/hooks/useHasMounted";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useHasMounted();
  const isLoginPage = pathname === "/login";
  const requiresAuth = isProtectedPath(pathname);

  useEffect(() => {
    if (!mounted || !isReady) return;

    if (!user && requiresAuth) {
      router.replace(loginPathWithRedirect(pathname));
      return;
    }

    if (user && isLoginPage) {
      const redirectTo = sanitizeRedirectPath(searchParams.get("redirect"));
      router.replace(redirectTo);
    }
  }, [user, isReady, requiresAuth, isLoginPage, pathname, router, mounted, searchParams]);

  if (!mounted || !isReady) {
    return <>{children}</>;
  }

  if (!user && requiresAuth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-[var(--muted)]">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}
