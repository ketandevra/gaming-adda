"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { shouldUseMockData } from "@/lib/api/config";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { isNavActive, mainNav } from "./nav";

function HeaderComponent() {
  const { user, isReady, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const isLoginPage = pathname === "/login";

  const showUserNav = mounted && isReady && !isLoginPage && user;
  const homeHref = showUserNav ? "/" : "/login";

  const navItems = useMemo(
    () =>
      mainNav.map((item) => ({
        ...item,
        active: isNavActive(pathname, item.href),
      })),
    [pathname],
  );

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setLogoutConfirmOpen(true);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setLogoutConfirmOpen(false);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setLogoutConfirmOpen(false);
    await logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5">
        <Link href={homeHref} className="group flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-sm font-black text-black">
            GA
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-[var(--foreground)] group-hover:text-[var(--accent)]">
              The Gaming Adda
            </p>
            <p className="hidden text-[10px] text-[var(--muted)] sm:block">
              Console slot booking
            </p>
          </div>
        </Link>

        {showUserNav ? (
          <>
            <nav className="hidden items-center gap-0.5 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                    item.active
                      ? "bg-white/10 text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]",
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-medium text-[var(--foreground)]">
                  {user.name}
                </p>
              </div>
              <Link
                href="/consoles"
                prefetch={false}
                className="hidden min-h-8 items-center rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-[var(--accent-hover)] lg:inline-flex"
              >
                Book Now
              </Link>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)] sm:min-h-8 sm:min-w-auto sm:px-2.5 sm:py-1.5 sm:text-xs"
                aria-label="Log out"
              >
                <span className="sm:hidden" aria-hidden>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </>
        ) : null}
      </div>

      {shouldUseMockData() ? (
        <div className="border-t border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-center text-[10px] text-amber-200">
          Demo mode — set <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_API_URL</code>
        </div>
      ) : null}

      {mounted && logoutConfirmOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex min-h-dvh w-full items-center justify-center bg-black/65 p-4"
              role="presentation"
              onClick={handleLogoutCancel}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-confirm-title"
                className="mx-auto w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="logout-confirm-title"
                  className="text-base font-semibold text-[var(--foreground)]"
                >
                  Log out?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                  You will need to sign in again to book consoles or view your
                  bookings.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={handleLogoutCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    fullWidth
                    onClick={handleLogoutConfirm}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

export const Header = memo(HeaderComponent);
