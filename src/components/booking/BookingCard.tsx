"use client";

import { memo, useMemo } from "react";
import { BookingPaymentPanel } from "@/components/booking/BookingPaymentPanel";
import { isPastBooking } from "@/lib/bookings/timing";
import {
  formatBookingCardDate,
  formatBookingTimeRange,
  formatApiStatus,
  formatCurrency,
  bookingDisplayStatus,
  bookingStatusBadgeVariant,
  isPaymentPending,
  paymentStatusBadgeVariant,
  cn,
} from "@/lib/utils";
import { areBookingsEqual } from "@/lib/react/compare";
import type { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onPaymentUpdated?: () => void;
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function accentBorderClass(
  variant: ReturnType<typeof bookingStatusBadgeVariant>,
  paymentPending: boolean,
): string {
  if (paymentPending) return "border-l-amber-400";
  switch (variant) {
    case "success":
      return "border-l-[var(--accent)]";
    case "warning":
      return "border-l-amber-400";
    case "default":
      return "border-l-[var(--muted)]";
    default:
      return "border-l-[var(--accent-secondary)]";
  }
}

function BookingCardComponent({ booking, onPaymentUpdated }: BookingCardProps) {
  const dateLabel = useMemo(
    () => formatBookingCardDate(booking),
    [booking.bookingDate, booking.startTime, booking.endTime, booking.slotId],
  );
  const timeLabel = useMemo(
    () => formatBookingTimeRange(booking.startTime, booking.endTime),
    [booking.startTime, booking.endTime],
  );
  const showPayment = useMemo(
    () => isPaymentPending(booking.paymentStatus),
    [booking.paymentStatus],
  );
  const statusBadgeVariant = useMemo(
    () => bookingStatusBadgeVariant(booking),
    [booking.bookingStatus, booking.status],
  );
  const displayStatus = useMemo(
    () => bookingDisplayStatus(booking),
    [booking.bookingStatus, booking.status],
  );
  const paymentLabel = useMemo(
    () =>
      booking.paymentStatus
        ? formatApiStatus(booking.paymentStatus)
        : null,
    [booking.paymentStatus],
  );
  const paymentVariant = useMemo(
    () =>
      booking.paymentStatus
        ? paymentStatusBadgeVariant(booking.paymentStatus)
        : null,
    [booking.paymentStatus],
  );
  const isPast = useMemo(() => isPastBooking(booking), [booking]);
  const consoleTitle =
    booking.consoleName ?? `Console ${booking.consoleId}`;
  const hasAmount =
    booking.totalAmount != null && booking.totalAmount > 0;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--border)] border-l-[3px] bg-[var(--surface)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition hover:border-[var(--accent)]/30",
        accentBorderClass(statusBadgeVariant, showPayment),
        isPast && "opacity-90",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent)]/5 blur-2xl transition group-hover:bg-[var(--accent)]/10" />

      <div className="relative p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-secondary)]/20 text-xs font-bold text-[var(--accent)]">
            {consoleTitle.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                  {consoleTitle}
                </h3>
                <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-[var(--muted)]">
                  {booking.id}
                </p>
              </div>
              {hasAmount ? (
                <p className="shrink-0 text-right text-sm font-bold leading-none text-[var(--accent)]">
                  {formatCurrency(booking.totalAmount!)}
                </p>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  statusBadgeVariant === "success" &&
                    "bg-emerald-500/15 text-emerald-300",
                  statusBadgeVariant === "warning" &&
                    "bg-amber-500/15 text-amber-300",
                  statusBadgeVariant === "default" &&
                    "bg-white/10 text-[var(--muted)]",
                  statusBadgeVariant === "accent" &&
                    "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]",
                )}
              >
                {displayStatus}
              </span>
              {paymentLabel && paymentVariant ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    paymentVariant === "warning" &&
                      "bg-amber-500/20 text-amber-200",
                    paymentVariant === "success" &&
                      "bg-emerald-500/15 text-emerald-300",
                    paymentVariant === "accent" &&
                      "bg-[var(--accent)]/15 text-[var(--accent)]",
                    paymentVariant === "default" &&
                      "bg-white/10 text-[var(--muted)]",
                  )}
                >
                  {paymentLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-black/25 px-3 py-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]">
            <CalendarIcon />
            <span className="font-medium">{dateLabel}</span>
          </span>
          <span className="hidden h-3 w-px bg-[var(--border)] sm:block" aria-hidden />
          <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
            <ClockIcon />
            <span>{timeLabel}</span>
          </span>
        </div>

        {booking.notes ? (
          <p className="mt-2 line-clamp-1 text-xs text-[var(--muted)]">
            {booking.notes}
          </p>
        ) : null}
      </div>

      {showPayment ? (
        <BookingPaymentPanel
          booking={booking}
          onSubmitted={onPaymentUpdated}
        />
      ) : null}
    </article>
  );
}

function bookingCardPropsAreEqual(
  prev: BookingCardProps,
  next: BookingCardProps,
): boolean {
  if (prev === next) return true;
  if (!prev?.booking || !next?.booking) return false;

  return (
    prev.onPaymentUpdated === next.onPaymentUpdated &&
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const BookingCard = memo(BookingCardComponent, bookingCardPropsAreEqual);
