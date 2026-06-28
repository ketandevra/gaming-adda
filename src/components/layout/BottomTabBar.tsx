"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import {
  NavBookingsIcon,
  NavConsoleIcon,
  NavHomeIcon,
} from "@/components/icons";
import { loginPathWithRedirect } from "@/lib/auth/paths";
import { useAuth } from "@/contexts/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { getNavItems, isNavActive } from "./nav";

const tabIcons = {
  "/": NavHomeIcon,
  "/consoles": NavConsoleIcon,
  "/bookings": NavBookingsIcon,
  "/admin": NavBookingsIcon,
} as const;

function BottomTabBarComponent() {
  const pathname = usePathname();
  const { user, isReady, isAdmin } = useAuth();
  const mounted = useHasMounted();

  const isLoginPage = pathname === "/login";
  const showTabs = mounted && isReady && !isLoginPage && user;

  const tabs = useMemo(
    () =>
      getNavItems(isAdmin).map((item) => ({
        ...item,
        active: isNavActive(pathname, item.href),
        Icon: tabIcons[item.href as keyof typeof tabIcons],
        requiresAuth: !isAdmin && item.href === "/bookings",
      })),
    [pathname, isAdmin],
  );

  if (!showTabs) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[var(--bottom-tab-height)] max-w-lg items-stretch justify-around">
        {tabs.map(({ href, shortLabel, active, Icon, requiresAuth }) => {
          const dest =
            requiresAuth && !user ? loginPathWithRedirect(href) : href;

          return (
            <Link
              key={href}
              href={dest}
              prefetch={href === "/consoles" ? false : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 touch-manipulation transition-colors",
                active
                  ? "text-[var(--accent-muted)]"
                  : "text-[var(--muted)] active:text-[var(--foreground)]",
              )}
              aria-current={active ? "page" : undefined}
            >
              {Icon ? <Icon active={active} size={20} /> : null}
              <span className="truncate text-[11px] font-semibold">
                {shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);
