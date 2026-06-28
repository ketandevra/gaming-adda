import { getPaymentExpiryState } from "@/lib/bookings/payment-expiry";
import type { Booking } from "@/types";

function normalizeStatus(value?: string): string {
  return value?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

export function isReservedWithUtrSubmitted(booking: Booking): boolean {
  const bookingSt = normalizeStatus(booking.bookingStatus ?? booking.status);
  const payment = normalizeStatus(booking.paymentStatus);
  return bookingSt.includes("reserved") && payment.includes("utr submitted");
}

/** Payment window still open (expiresAt in the future). */
export function isPaymentWindowOpen(
  booking: Booking,
  now = Date.now(),
): boolean {
  if (!booking.expiresAt) return false;
  const expiry = getPaymentExpiryState(booking.expiresAt, now);
  return expiry?.isExpired === false;
}

/** Admin Pending: Reserved + UTR submitted + expiresAt not passed. */
export function isAdminPendingBooking(
  booking: Booking,
  now = Date.now(),
): boolean {
  return isReservedWithUtrSubmitted(booking) && isPaymentWindowOpen(booking, now);
}

/**
 * Reserved + UTR submitted + expiresAt has passed.
 * Refund is not shown while the payment window is still open.
 */
export function isRefundEligibleBooking(
  booking: Booking,
  now = Date.now(),
): boolean {
  if (!isReservedWithUtrSubmitted(booking) || !booking.expiresAt) return false;

  const expiry = getPaymentExpiryState(booking.expiresAt, now);
  return expiry?.isExpired === true;
}

/** Tick expiry for pending → refund transitions without a refresh. */
export function shouldWatchPaymentExpiry(booking: Booking): boolean {
  return isReservedWithUtrSubmitted(booking) && Boolean(booking.expiresAt);
}

/** @deprecated Use shouldWatchPaymentExpiry */
export function shouldWatchRefundExpiry(booking: Booking): boolean {
  return shouldWatchPaymentExpiry(booking);
}
