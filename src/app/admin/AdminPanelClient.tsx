"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminBookingRow } from "@/components/admin/AdminBookingRow";
import { AdminBookingSummary, DEFAULT_ADMIN_STATS_PERIOD } from "@/components/admin/AdminBookingSummary";
import { RefreshIcon, SearchEmptyIcon, SearchIcon } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  ADMIN_BOOKING_FILTERS,
  DEFAULT_ADMIN_BOOKING_FILTER,
  countAdminBookingsByFilter,
  filterAdminBookingsForView,
  normalizeBookingNumberQuery,
  type AdminBookingFilter,
} from "@/lib/bookings/admin-filters";
import { enrichBookingPaymentAmounts } from "@/lib/bookings/payment";
import { shouldWatchPaymentExpiry } from "@/lib/bookings/refund";
import type { AdminStatsPeriod } from "@/lib/bookings/admin-stats";
import { fetchAllBookings, fetchConsoles } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Booking, GameConsole } from "@/types";

function consolesById(consoles: GameConsole[]): Map<string, GameConsole> {
  return new Map(consoles.map((consoleItem) => [consoleItem.id, consoleItem]));
}

function AdminListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="user-booking-card booking-card overflow-hidden">
          <div className="h-0.5 animate-pulse bg-[var(--accent-soft)]" />
          <div className="space-y-2.5 p-3.5">
            <div className="flex justify-between gap-2">
              <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--surface-elevated)]" />
              <div className="h-6 w-14 animate-pulse rounded-md bg-[var(--surface-elevated)]" />
            </div>
            <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--surface-elevated)]" />
            <div className="flex gap-1.5">
              <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--surface-elevated)]" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--surface-elevated)]" />
            </div>
            <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--surface-elevated)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminPanelClient() {
  const { isReady, isAdmin } = useAuth();
  const mounted = useHasMounted();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consolesByIdMap, setConsolesByIdMap] = useState<Map<string, GameConsole>>(
    () => new Map(),
  );
  const [filter, setFilter] = useState<AdminBookingFilter>("pending");
  const [bookingSearch, setBookingSearch] = useState("");
  const [statsPeriod, setStatsPeriod] = useState<AdminStatsPeriod>(
    DEFAULT_ADMIN_STATS_PERIOD,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterNow, setFilterNow] = useState(() => Date.now());

  const watchesPaymentExpiry = useMemo(
    () => bookings.some(shouldWatchPaymentExpiry),
    [bookings],
  );

  useEffect(() => {
    if (!watchesPaymentExpiry) return;
    const id = window.setInterval(() => setFilterNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [watchesPaymentExpiry]);

  const loadBookings = useCallback(
    async (force = false) => {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [rows, consoles] = await Promise.all([
          fetchAllBookings({ force }),
          fetchConsoles(),
        ]);
        setConsolesByIdMap(consolesById(consoles));
        setBookings(enrichBookingPaymentAmounts(rows, consoles));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not load bookings";
        if (/invalid action/i.test(message)) {
          setError(
            "View Bookings needs the getBookings action in your Google Apps Script. Redeploy the web app, then refresh.",
          );
        } else {
          setError(message);
        }
        setBookings([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!mounted || !isReady || !isAdmin) return;
    void loadBookings();
  }, [mounted, isReady, isAdmin, loadBookings]);

  useEffect(() => {
    setFilter(DEFAULT_ADMIN_BOOKING_FILTER);
    setBookingSearch("");
  }, [pathname]);

  const isSearching = normalizeBookingNumberQuery(bookingSearch).length > 0;

  const counts = useMemo(
    () => countAdminBookingsByFilter(bookings, filterNow),
    [bookings, filterNow],
  );

  const filteredBookings = useMemo(
    () => filterAdminBookingsForView(bookings, filter, bookingSearch, filterNow),
    [bookings, filter, bookingSearch, filterNow],
  );

  if (!mounted || !isReady) return <AdminListSkeleton />;

  return (
    <div className="admin-view page-shell pb-24">
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="page-title">View Bookings</h1>
          <p className="mt-1 hidden text-sm text-[var(--foreground-secondary)] sm:block">
            Booking summary, pending UTR verification, and full booking list.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadBookings(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 min-h-10 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition hover:border-[var(--accent)] disabled:opacity-60 sm:px-4"
        >
          <RefreshIcon size={16} className={refreshing ? "animate-spin" : undefined} />
          Refresh
        </button>
      </div>

      <AdminBookingSummary
        bookings={bookings}
        period={statsPeriod}
        loading={loading}
        onPeriodChange={setStatsPeriod}
      />

      <div className="admin-booking-search mb-5 sm:mb-6">
        <SearchIcon size={16} className="admin-booking-search-icon" aria-hidden />
        <input
          type="search"
          value={bookingSearch}
          onChange={(event) => setBookingSearch(event.target.value)}
          placeholder="Search by booking number"
          aria-label="Search by booking number"
          className="admin-booking-search-input"
        />
        {bookingSearch ? (
          <button
            type="button"
            className="admin-booking-search-clear"
            onClick={() => setBookingSearch("")}
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="admin-booking-filters mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:flex sm:w-auto sm:flex-wrap">
          {ADMIN_BOOKING_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "flex min-h-10 items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold transition sm:py-1.5",
                filter === item.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent-muted)]"
                  : "border border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--accent)]",
              )}
            >
              <span>{item.label}</span>
              <span className="ml-1.5 text-xs opacity-70">({counts[item.id]})</span>
            </button>
          ))}
      </div>

      {error ? (
        <p className="alert-error mb-4 rounded-[var(--radius-md)] px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      {loading ? (
        <AdminListSkeleton />
      ) : filteredBookings.length === 0 ? (
        <div className="bookings-empty rounded-2xl border border-dashed border-[var(--border)]">
          <div className="bookings-empty-icon" aria-hidden>
            <SearchEmptyIcon size={28} strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
            {isSearching
              ? `No booking found for “${bookingSearch.trim()}”`
              : "No bookings match this filter"}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            {isSearching
              ? "Check the booking number and try again."
              : "Try another filter or refresh the list."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredBookings.map((booking) => (
            <AdminBookingRow
              key={booking.id}
              booking={booking}
              console={consolesByIdMap.get(booking.consoleId)}
              onUpdated={() => void loadBookings(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
