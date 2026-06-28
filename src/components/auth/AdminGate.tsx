"use client";

import { useAuth } from "@/contexts/AuthContext";
import { isAdminPath, loginPathWithRedirect } from "@/lib/auth/paths";
import { useHasMounted } from "@/hooks/useHasMounted";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isReady, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const onAdminRoute = isAdminPath(pathname);

  useEffect(() => {
    if (!mounted || !isReady || !onAdminRoute) return;
    if (!user) {
      router.replace(loginPathWithRedirect(pathname));
      return;
    }
    if (!isAdmin) router.replace("/");
  }, [mounted, isReady, onAdminRoute, user, isAdmin, pathname, router]);

  if (!mounted || !isReady || !onAdminRoute) return <>{children}</>;

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-[var(--muted)]">
        Redirecting to login…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-shell py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Admin access only</h1>
        <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
          Sign in with the admin mobile and password to continue.
        </p>
        <Link href="/login" className="link-btn-primary mt-6 inline-flex rounded-2xl px-5 py-3">
          Go to login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
