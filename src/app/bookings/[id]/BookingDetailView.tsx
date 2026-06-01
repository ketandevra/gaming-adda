"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { fetchBooking } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  formatBookingCardDate,
  formatBookingTimeRange,
  formatCurrency,
  statusLabel,
} from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingDetailViewProps {
  id: string;
}

function storageKey(id: string) {
  return `gaming-adda:booking:${id}`;
}

function PageWrap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl px-4 py-8 pb-24 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function BookingDetailView({ id }: BookingDetailViewProps) {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "1";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(storageKey(id));
    if (cached) {
      try {
        setBooking(JSON.parse(cached) as Booking);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(storageKey(id));
      }
    }

    fetchBooking(id)
      .then((data) => {
        if (data) setBooking(data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageWrap>
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </PageWrap>
    );
  }

  if (notFound || !booking) {
    return (
      <PageWrap className="text-center">
        <h1 className="font-display text-2xl font-bold">Booking not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Look up your booking from My Bookings using your email or phone.
        </p>
        <Link
          href="/bookings"
          className="mt-6 inline-flex rounded-2xl bg-[var(--accent)] px-5 py-3 font-semibold text-black"
        >
          My Bookings
        </Link>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {confirmed ? (
        <div className="mb-5 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-center text-sm text-[var(--accent)] sm:mb-6">
          Booking confirmed! See you at The Gaming Adda.
        </div>
      ) : null}

      <Badge variant="success">{statusLabel(booking.status)}</Badge>
      <h1 className="font-display mt-3 text-2xl font-bold sm:text-3xl">Booking details</h1>
      <p className="mt-1 break-all font-mono text-xs text-[var(--muted)] sm:text-sm">
        {booking.id}
      </p>

      <dl className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:mt-8 sm:p-6">
        <div>
          <dt className="text-sm text-[var(--muted)]">Console</dt>
          <dd className="text-lg font-semibold">
            {booking.consoleName ?? booking.consoleId}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Date</dt>
          <dd className="text-sm sm:text-base">{formatBookingCardDate(booking)}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Time</dt>
          <dd className="text-sm sm:text-base">
            {formatBookingTimeRange(booking.startTime, booking.endTime)}
          </dd>
        </div>
        {booking.totalAmount != null && booking.totalAmount > 0 ? (
          <div>
            <dt className="text-sm text-[var(--muted)]">Total</dt>
            <dd className="text-2xl font-bold text-[var(--accent)]">
              {formatCurrency(booking.totalAmount)}
            </dd>
          </div>
        ) : null}
        <div className="border-t border-[var(--border)] pt-4">
          <dt className="text-sm text-[var(--muted)]">Guest</dt>
          <dd className="mt-1">{booking.customerName}</dd>
          {booking.customerPhone ? (
            <dd className="text-sm text-[var(--muted)]">{booking.customerPhone}</dd>
          ) : null}
        </div>
        {booking.notes ? (
          <div>
            <dt className="text-sm text-[var(--muted)]">Notes</dt>
            <dd className="text-sm">{booking.notes}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
        <Link
          href="/consoles"
          className="touch-target flex items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-center font-semibold text-black active:scale-[0.98] hover:bg-[var(--accent-hover)]"
        >
          Book another slot
        </Link>
        <Link
          href="/bookings"
          className="touch-target flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-center active:scale-[0.98] hover:border-[var(--accent)]"
        >
          My bookings
        </Link>
      </div>
    </PageWrap>
  );
}

export function cacheBooking(booking: Booking) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(storageKey(booking.id), JSON.stringify(booking));
  }
}
