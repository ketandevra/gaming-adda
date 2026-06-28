"use client";

import { memo, useMemo } from "react";
import { BookingCardSchedule } from "@/components/booking/BookingCardSchedule";
import { BookingCardConsoleSummary } from "@/components/booking/BookingCardConsoleSummary";
import { BookingCardNumber } from "@/components/booking/BookingCardNumber";
import { BookingCardTimestamps } from "@/components/booking/BookingCardTimestamps";
import { BookingPaymentPanel } from "@/components/booking/BookingPaymentPanel";
import { BookingRefundBanner } from "@/components/booking/BookingRefundBanner";
import { InfoIcon } from "@/components/icons";
import { usePaymentExpiryCountdown } from "@/hooks/usePaymentExpiryCountdown";
import { STATUS_BADGE_CLASS } from "@/lib/bookings/status-styles";
import { isPastBooking } from "@/lib/bookings/timing";
import {
  getBookingSlotCount,
  getBookingSlotLines,
} from "@/lib/bookings/group";
import {
  getUserBookingStatusLabel,
  resolveUserBookingStatus,
  shouldWatchUserBookingExpiry,
  userBookingStatusTone,
} from "@/lib/bookings/user-booking-status";
import {
  formatBookingCardDate,
  formatBookingTimeRange,
  formatCurrency,
  cn,
} from "@/lib/utils";
import { areBookingsEqual } from "@/lib/react/compare";
import type { Booking, GameConsole } from "@/types";

interface BookingCardProps {
  booking: Booking;
  console?: GameConsole | null;
  onPaymentUpdated?: () => void;
}

function BookingCardComponent({ booking, console: gameConsole, onPaymentUpdated }: BookingCardProps) {
  const dateLabel = useMemo(
    () => formatBookingCardDate(booking),
    [booking.bookingDate, booking.startTime, booking.endTime, booking.slotId],
  );
  const slotCount = useMemo(() => getBookingSlotCount(booking), [booking]);
  const slotLines = useMemo(() => getBookingSlotLines(booking), [booking]);
  const timeLabel = useMemo(
    () => formatBookingTimeRange(booking.startTime, booking.endTime),
    [booking.startTime, booking.endTime],
  );
  const watchExpiry = useMemo(
    () => shouldWatchUserBookingExpiry(booking),
    [booking],
  );
  const expiryState = usePaymentExpiryCountdown(booking.expiresAt, watchExpiry);
  const userStatus = useMemo(() => {
    if (watchExpiry && expiryState?.isExpired) {
      const expiredAt = booking.expiresAt
        ? new Date(booking.expiresAt).getTime() + 1
        : Date.now();
      return resolveUserBookingStatus(booking, expiredAt);
    }
    return resolveUserBookingStatus(booking);
  }, [booking, watchExpiry, expiryState?.isExpired]);
  const statusLabel = useMemo(
    () => getUserBookingStatusLabel(userStatus),
    [userStatus],
  );
  const statusTone = useMemo(
    () => userBookingStatusTone(userStatus),
    [userStatus],
  );
  const isPast = useMemo(() => isPastBooking(booking), [booking]);
  const consoleTitle =
    booking.consoleName ?? `Console ${booking.consoleId}`;
  const hasAmount =
    booking.totalAmount != null && booking.totalAmount > 0;

  return (
    <article
      className={cn(
        "user-booking-card booking-card w-full min-w-0 overflow-hidden",
        isPast && "booking-card-past",
        userStatus === "payment-pending" && "user-booking-card--payment",
        userStatus === "refund" && "user-booking-card--refund",
      )}
    >
      <div className="booking-card-accent" aria-hidden />

      <div className="user-booking-card-body min-w-0">
        <BookingCardNumber bookingId={booking.id} />
        <BookingCardConsoleSummary
          booking={booking}
          console={gameConsole}
          title={consoleTitle}
          badges={
            <>
              <span className={STATUS_BADGE_CLASS[statusTone]}>
                {statusLabel}
              </span>
              {slotCount > 1 ? (
                <span className="user-booking-slot-badge">
                  {slotCount} slots
                </span>
              ) : null}
            </>
          }
          trailing={
            hasAmount ? (
              <span className="user-booking-amount">
                {formatCurrency(booking.totalAmount!)}
              </span>
            ) : null
          }
        />

        <BookingCardSchedule
          dateLabel={dateLabel}
          timeLabel={slotLines.length <= 1 ? timeLabel : undefined}
          slotLines={slotLines.length > 1 ? slotLines : undefined}
        />

        <BookingCardTimestamps booking={booking} />

        {booking.notes ? (
          <p className="user-booking-notes">{booking.notes}</p>
        ) : null}
      </div>

      {userStatus === "refund" ? (
        <BookingRefundBanner variant="user" />
      ) : userStatus === "verifying-payment" ? (
        <div className="user-booking-verify-banner" role="status">
          <InfoIcon size={15} className="shrink-0" />
          <span>
            Verifying payment — we received your UTR and are confirming it.
          </span>
        </div>
      ) : userStatus === "payment-pending" ? (
        <BookingPaymentPanel
          booking={booking}
          onSubmitted={onPaymentUpdated}
          compact
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
    prev.console?.id === next.console?.id &&
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const BookingCard = memo(BookingCardComponent, bookingCardPropsAreEqual);
