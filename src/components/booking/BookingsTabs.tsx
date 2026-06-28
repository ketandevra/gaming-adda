"use client";

import Link from "next/link";
import { CalendarIcon, ChevronRightIcon, ClockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type BookingsTab = "upcoming" | "past";

interface BookingsTabsProps {
  active: BookingsTab;
  upcomingCount: number;
  pastCount: number;
  onChange: (tab: BookingsTab) => void;
}

export function BookingsTabs({
  active,
  upcomingCount,
  pastCount,
  onChange,
}: BookingsTabsProps) {
  const tabs: {
    id: BookingsTab;
    label: string;
    count: number;
    Icon: typeof CalendarIcon;
  }[] = [
    { id: "upcoming", label: "Upcoming", count: upcomingCount, Icon: CalendarIcon },
    { id: "past", label: "Past", count: pastCount, Icon: ClockIcon },
  ];

  return (
    <div className="bookings-tabs" role="tablist" aria-label="Booking filters">
      {tabs.map((tab) => {
        const selected = active === tab.id;
        const TabIcon = tab.Icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-10 touch-manipulation items-center justify-center gap-1.5 px-3 py-2 text-sm transition",
              selected ? "bookings-tab-active" : "bookings-tab-inactive",
            )}
          >
            <TabIcon size={16} />
            {tab.label}
            <span
              className={cn(
                "ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                selected
                  ? "bg-white/25 text-white"
                  : "bg-[var(--border)] text-[var(--muted)]",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface BookingsEmptyProps {
  message: string;
  showBrowse?: boolean;
}

export function BookingsEmpty({ message, showBrowse }: BookingsEmptyProps) {
  return (
    <div className="bookings-empty">
      <div className="bookings-empty-icon" aria-hidden>
        <CalendarIcon size={28} strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--foreground)]">{message}</p>
      {showBrowse ? (
        <Link
          href="/consoles"
          prefetch={false}
          className="link-btn-primary mt-5 inline-flex items-center gap-1.5"
        >
          Browse consoles
          <ChevronRightIcon size={16} />
        </Link>
      ) : null}
    </div>
  );
}
