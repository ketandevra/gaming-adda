"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  GamepadIcon,
  NavBookingsIcon,
  SearchEmptyIcon,
  UserIcon,
} from "@/components/icons";
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
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--surface-elevated)]" />
      </PageWrap>
    );
  }

  if (notFound || !booking) {
    return (
      <PageWrap className="text-center">
        <div className="bookings-empty-icon mx-auto" aria-hidden>
          <SearchEmptyIcon size={28} strokeWidth={1.5} />
        </div>
        <h1 className="font-display mt-4 text-2xl font-bold">Booking not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Look up your booking from My Bookings using your email or phone.
        </p>
        <Link
          href="/bookings"
          className="mt-6 link-btn-primary inline-flex items-center gap-1.5 rounded-2xl px-5 py-3"
        >
          <NavBookingsIcon size={18} />
          My Bookings
        </Link>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {confirmed ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800 sm:mb-6">
          <p className="inline-flex items-center justify-center gap-1.5 font-medium">
            <CheckCircleIcon size={18} />
            Booking confirmed! See you at The Gaming Adda.
          </p>
        </div>
      ) : null}

      <Badge variant="success">{statusLabel(booking.status)}</Badge>
      <h1 className="font-display mt-3 text-2xl font-bold sm:text-3xl">Booking details</h1>
      <p className="mt-1 break-all font-mono text-xs text-[var(--muted)] sm:text-sm">
        {booking.id}
      </p>

      <dl className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:mt-8 sm:p-6">
        <div>
          <dt className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
            <GamepadIcon size={14} />
            Console
          </dt>
          <dd className="text-lg font-semibold">
            {booking.consoleName ?? booking.consoleId}
          </dd>
        </div>
        <div>
          <dt className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
            <CalendarIcon size={14} />
            Date
          </dt>
          <dd className="text-sm sm:text-base">{formatBookingCardDate(booking)}</dd>
        </div>
        <div>
          <dt className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
            <ClockIcon size={14} />
            Time
          </dt>
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
          <dt className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
            <UserIcon size={14} />
            Guest
          </dt>
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
          className="touch-target link-btn-primary inline-flex items-center justify-center gap-1.5 rounded-2xl px-5 py-3.5"
        >
          <GamepadIcon size={18} />
          Book another slot
        </Link>
        <Link
          href="/bookings"
          className="touch-target flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-center active:scale-[0.98] hover:border-[var(--accent)]"
        >
          <NavBookingsIcon size={18} />
          My bookings
          <ChevronRightIcon size={16} className="opacity-60" />
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
