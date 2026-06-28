"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  BookingsEmpty,
  BookingsTabs,
  type BookingsTab,
} from "@/components/booking/BookingsTabs";
import { useAuthMobile } from "@/hooks/useAuthMobile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { enrichBookingPaymentAmounts } from "@/lib/bookings/payment";
import { groupBookingsForDisplay } from "@/lib/bookings/group";
import { partitionBookings } from "@/lib/bookings/timing";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import { RefreshIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { getCached } from "@/lib/api/cache";
import { fetchBookings, fetchConsoles } from "@/lib/api/client";
import type { Booking, GameConsole } from "@/types";

function consolesById(consoles: GameConsole[]): Map<string, GameConsole> {
  return new Map(consoles.map((consoleItem) => [consoleItem.id, consoleItem]));
}

function bookingsCacheKey(mobile: string) {
  return `bookings:${mobile}`;
}

function BookingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="user-booking-card booking-card overflow-hidden">
          <div className="h-0.5 animate-pulse bg-[var(--accent-soft)]" />
          <div className="space-y-2.5 p-3.5">
            <div className="flex justify-between gap-2">
              <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--surface-elevated)]" />
              <div className="h-6 w-14 animate-pulse rounded-md bg-[var(--surface-elevated)]" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--surface-elevated)]" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--surface-elevated)]" />
            </div>
            <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--surface-elevated)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingsLookupClient() {
  const { isReady } = useAuth();
  const mounted = useHasMounted();
  const mobile = useAuthMobile();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consolesByIdMap, setConsolesByIdMap] = useState<Map<string, GameConsole>>(
    () => new Map(),
  );
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
        setBookings(groupBookingsForDisplay(cached));
        setRefreshing(false);
        void fetchConsoles()
          .then((consoles) => {
            setConsolesByIdMap(consolesById(consoles));
            setBookings(groupBookingsForDisplay(enrichBookingPaymentAmounts(cached, consoles)));
          })
          .catch(() => undefined);
        return;
      }

      if (!cached || force) setRefreshing(true);
      setError(null);

      try {
        const [data, consoles] = await Promise.all([
          fetchBookings({ mobile }, { force }),
          fetchConsoles(),
        ]);
        const enriched = enrichBookingPaymentAmounts(data, consoles);
        setConsolesByIdMap(consolesById(consoles));
        setBookings(groupBookingsForDisplay(enriched));
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
          console={consolesByIdMap.get(b.consoleId)}
          onPaymentUpdated={handlePaymentUpdated}
        />
      )),
    [visibleBookings, consolesByIdMap, handlePaymentUpdated],
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
      ? "No upcoming bookings yet"
      : "No past bookings yet";

  return (
    <div className="space-y-5">
      {bookingSuccess ? (
        <p className="alert-success px-4 py-3" role="status">
          Booking confirmed! Your sessions are listed below.
        </p>
      ) : null}

      <div className="bookings-toolbar">
        <BookingsTabs
          active={activeTab}
          upcomingCount={upcoming.length}
          pastCount={past.length}
          onChange={setActiveTab}
        />
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshDisabled}
          aria-label={refreshing ? "Refreshing bookings" : "Refresh bookings"}
          title={refreshing ? "Refreshing…" : "Refresh"}
          className="bookings-refresh-btn"
        >
          <RefreshIcon spinning={refreshing} size={16} />
        </button>
      </div>

      {refreshing && bookings.length > 0 ? (
        <p className="text-center text-xs text-[var(--muted)]" role="status">
          Updating bookings…
        </p>
      ) : null}

      {error ? <p className="alert-error px-4 py-3">{error}</p> : null}

      {showSkeleton ? (
        <BookingListSkeleton />
      ) : (
        <div className="space-y-3 min-w-0" role="tabpanel">
          {bookings.length === 0 ? (
            <BookingsEmpty
              message="You haven't booked any sessions yet"
              showBrowse
            />
          ) : visibleBookings.length === 0 ? (
            <BookingsEmpty
              message={emptyMessage}
              showBrowse={activeTab === "upcoming"}
            />
          ) : (
            bookingCards
          )}
        </div>
      )}
    </div>
  );
}
