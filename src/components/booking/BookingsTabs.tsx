"use client";

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
  const tabs: { id: BookingsTab; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: upcomingCount },
    { id: "past", label: "Past", count: pastCount },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5"
      role="tablist"
      aria-label="Booking filters"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-h-9 touch-manipulation rounded-md px-2 py-2 text-xs font-semibold transition",
              selected
                ? "bg-[var(--accent)] text-black shadow-[0_0_12px_rgba(0,255,198,0.15)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1 tabular-nums font-medium opacity-80",
                selected ? "text-black/70" : "",
              )}
            >
              ({tab.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
