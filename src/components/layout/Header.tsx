"use client";

import { Logo } from "@/components/layout/Logo";
import {
  ChevronRightIcon,
  LoginIcon,
  LogoutIcon,
  NavBookingsIcon,
  NavConsoleIcon,
  NavHomeIcon,
} from "@/components/icons";
import { memo, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { shouldUseMockData } from "@/lib/api/config";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { isNavActive, getNavItems } from "./nav";

const desktopNavIcons = {
  "/": NavHomeIcon,
  "/consoles": NavConsoleIcon,
  "/bookings": NavBookingsIcon,
  "/admin": NavBookingsIcon,
} as const;

function HeaderComponent() {
  const { user, isReady, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const isLoginPage = pathname === "/login";

  const showUserNav = mounted && isReady && !isLoginPage && user;
  const showGuestNav = mounted && isReady && !isLoginPage && !user;
  const homeHref = "/";

  const navItems = useMemo(
    () =>
      getNavItems(isAdmin).map((item) => ({
        ...item,
        active: isNavActive(pathname, item.href),
      })),
    [pathname, isAdmin],
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
    router.replace("/");
  }, [logout, router]);

  return (
    <header
      className="site-header-accent sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href={homeHref} className="group flex min-w-0 flex-1 items-center gap-2 sm:flex-initial sm:gap-2.5">
          <Logo size={44} priority />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight text-[var(--foreground)]">
              The Gaming Adda
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              Book. Play. Enjoy.
            </p>
          </div>
        </Link>

        {showUserNav ? (
          <>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const NavIcon =
                  desktopNavIcons[item.href as keyof typeof desktopNavIcons];
                return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition",
                    item.active
                      ? "bg-[var(--accent-soft)] text-[var(--accent-muted)]"
                      : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  {NavIcon ? <NavIcon active={item.active} size={16} /> : null}
                  {item.label}
                </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {user.name}
                </p>
              </div>
              {!isAdmin ? (
                <Link
                  href="/consoles"
                  prefetch={false}
                  className="btn-gradient hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-4 py-2 text-sm lg:inline-flex"
                >
                  Book Now
                  <ChevronRightIcon size={16} />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] text-sm text-[var(--foreground-secondary)] transition hover:border-[var(--cyan)] hover:text-[var(--foreground)] sm:min-w-auto sm:px-3"
                aria-label="Log out"
              >
                <LogoutIcon className="sm:hidden" size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </>
        ) : showGuestNav ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/consoles"
              prefetch={false}
              className="hidden min-h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-secondary)] transition hover:border-[var(--cyan)] sm:inline-flex"
            >
              Consoles
            </Link>
            <Link
              href="/login"
              className="btn-gradient inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-4 py-2 text-sm font-bold"
            >
              <LoginIcon size={16} />
              Login
            </Link>
          </div>
        ) : null}
      </div>

      {shouldUseMockData() ? (
        <div className="border-t border-amber-200 bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-800">
          Demo mode — set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_API_URL</code>
        </div>
      ) : null}

      {mounted && logoutConfirmOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex min-h-dvh w-full items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
              role="presentation"
              onClick={handleLogoutCancel}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-confirm-title"
                className="card mx-auto w-full max-w-sm p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  id="logout-confirm-title"
                  className="text-lg font-bold text-[var(--foreground)]"
                >
                  Log out?
                </h2>
                <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                  {isAdmin
                    ? "You will need to sign in again to access the admin panel."
                    : "You will need to sign in again to book consoles or view your bookings."}
                </p>
                <div className="mt-5 flex gap-2">
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
