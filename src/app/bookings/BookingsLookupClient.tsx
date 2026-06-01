"use client";

import { useAuth } from "@/contexts/AuthContext";
import { BookingsTabs, type BookingsTab } from "@/components/booking/BookingsTabs";
import { useAuthMobile } from "@/hooks/useAuthMobile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { partitionBookings } from "@/lib/bookings/timing";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import { cn } from "@/lib/utils";
import { getCached } from "@/lib/api/cache";
import { fetchBookings } from "@/lib/api/client";
import type { Booking } from "@/types";

function bookingsCacheKey(mobile: string) {
  return `bookings:${mobile}`;
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4", spinning && "animate-spin")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function BookingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-[5.5rem] animate-pulse rounded-xl border border-[var(--border)] bg-white/[0.03]"
        />
      ))}
    </div>
  );
}

export function BookingsLookupClient() {
  const { isReady } = useAuth();
  const mounted = useHasMounted();
  const mobile = useAuthMobile();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingsTab>("upcoming");

  const loadBookings = useCallback(
    async (force = false) => {
      if (!mobile) {
        setError("No mobile number found. Please log in again.");
        setBookings([]);
        setRefreshing(false);
        return;
      }

      const cached = getCached<Booking[]>(bookingsCacheKey(mobile));
      if (cached && !force) {
        setBookings(cached);
        setRefreshing(false);
        return;
      }

      if (!cached || force) setRefreshing(true);
      setError(null);

      try {
        const data = await fetchBookings({ mobile }, { force });
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load bookings");
        if (!cached) setBookings([]);
      } finally {
        setRefreshing(false);
      }
    },
    [mobile],
  );

  const handlePaymentUpdated = useCallback(() => {
    loadBookings(true);
  }, [loadBookings]);

  const handleRefresh = useCallback(() => {
    loadBookings(true);
  }, [loadBookings]);

  const { upcoming, past } = useMemo(
    () => partitionBookings(bookings),
    [bookings],
  );

  const visibleBookings = activeTab === "upcoming" ? upcoming : past;

  const bookingCards = useMemo(
    () =>
      visibleBookings.map((b) => (
        <BookingCard
          key={b.id}
          booking={b}
          onPaymentUpdated={handlePaymentUpdated}
        />
      )),
    [visibleBookings, handlePaymentUpdated],
  );

  useEffect(() => {
    if (!mounted || !isReady) return;

    const justBooked =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("gaming-adda:booking-success") === "1";

    if (justBooked) {
      sessionStorage.removeItem("gaming-adda:booking-success");
      setBookingSuccess(true);
      setActiveTab("upcoming");
    }

    loadBookings(justBooked);
  }, [mounted, isReady, loadBookings]);

  const showSkeleton = refreshing && bookings.length === 0;
  const refreshDisabled = refreshing || !mounted || !isReady;

  const emptyMessage =
    activeTab === "upcoming"
      ? "No upcoming bookings. Book a console to get started."
      : "No past bookings yet.";

  return (
    <div className="space-y-4">
      {bookingSuccess ? (
        <p
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          role="status"
        >
          Booking confirmed! Your session is listed below.
        </p>
      ) : null}

      <div className="flex items-stretch gap-2">
        <div className="min-w-0 flex-1">
          <BookingsTabs
            active={activeTab}
            upcomingCount={upcoming.length}
            pastCount={past.length}
            onChange={setActiveTab}
          />
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshDisabled}
          aria-label={refreshing ? "Refreshing bookings" : "Refresh bookings"}
          title={refreshing ? "Refreshing…" : "Refresh"}
          className={cn(
            "flex shrink-0 touch-manipulation items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[var(--muted)] transition",
            "hover:border-[var(--accent)] hover:text-[var(--foreground)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <RefreshIcon spinning={refreshing} />
        </button>
      </div>

      {refreshing && bookings.length > 0 ? (
        <p className="text-center text-[11px] text-[var(--muted)]" role="status">
          Updating bookings…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      ) : null}

      {showSkeleton ? (
        <BookingListSkeleton />
      ) : (
        <div className="space-y-3" role="tabpanel">
          {bookings.length === 0 ? (
            <p className="py-8 text-center text-[var(--muted)]">
              No bookings yet. Book a console to get started.
            </p>
          ) : visibleBookings.length === 0 ? (
            <p className="py-8 text-center text-[var(--muted)]">{emptyMessage}</p>
          ) : (
            bookingCards
          )}
        </div>
      )}
    </div>
  );
}
