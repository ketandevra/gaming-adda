"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { isNavActive, mainNav } from "./nav";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h4"
      />
    </svg>
  );
}

function ConsoleIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12h4m8 0h-4M8 16h8M7 8h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2z"
      />
    </svg>
  );
}

function BookingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

const tabIcons = {
  "/": HomeIcon,
  "/consoles": ConsoleIcon,
  "/bookings": BookingsIcon,
} as const;

function BottomTabBarComponent() {
  const pathname = usePathname();
  const { user, isReady } = useAuth();
  const mounted = useHasMounted();

  const isLoginPage = pathname === "/login";
  const showTabs = mounted && isReady && user && !isLoginPage;

  const tabs = useMemo(
    () =>
      mainNav.map((item) => ({
        ...item,
        active: isNavActive(pathname, item.href),
        Icon: tabIcons[item.href],
      })),
    [pathname],
  );

  if (!showTabs) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[var(--bottom-tab-height)] max-w-lg items-stretch justify-around">
        {tabs.map(({ href, shortLabel, active, Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={href === "/consoles" ? false : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 touch-manipulation transition-colors",
              active
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] active:text-[var(--foreground)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon active={active} />
            <span className="truncate text-[10px] font-semibold uppercase tracking-wide">
              {shortLabel}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);
