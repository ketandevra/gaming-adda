import { getPaymentExpiryState } from "@/lib/bookings/payment-expiry";
import { isPaymentVerifying } from "@/lib/bookings/payment";
import type { BookingStatusTone } from "@/lib/bookings/status-styles";
import type { Booking } from "@/types";

export type UserBookingStatus =
  | "payment-pending"
  | "verifying-payment"
  | "cancelled"
  | "refund"
  | "confirmed";

const USER_BOOKING_STATUS_LABELS: Record<UserBookingStatus, string> = {
  "payment-pending": "Payment Pending",
  "verifying-payment": "Verifying Payment",
  cancelled: "Cancelled",
  refund: "Refund",
  confirmed: "Confirmed",
};

function normalizeStatus(value?: string): string {
  return value?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

function isBookingConfirmed(booking: Booking): boolean {
  const bookingSt = normalizeStatus(booking.bookingStatus ?? booking.status);
  const payment = normalizeStatus(booking.paymentStatus);

  return (
    bookingSt.includes("confirm") ||
    bookingSt.includes("complete") ||
    payment.includes("paid") ||
    payment.includes("verified") ||
    (payment.includes("success") && !payment.includes("unsuccess"))
  );
}

export function hasUtrSubmitted(booking: Booking): boolean {
  const payment = normalizeStatus(booking.paymentStatus);
  if (payment.includes("utr submitted")) return true;
  if (isPaymentVerifying(booking.paymentStatus)) return true;
  return Boolean(booking.utrNumber?.trim());
}

export function isPaymentExpired(booking: Booking, now = Date.now()): boolean {
  if (!booking.expiresAt) return false;
  const expiry = getPaymentExpiryState(booking.expiresAt, now);
  return expiry?.isExpired === true;
}

export function resolveUserBookingStatus(
  booking: Booking,
  now = Date.now(),
): UserBookingStatus {
  if (isBookingConfirmed(booking)) {
    return "confirmed";
  }

  const bookingSt = normalizeStatus(booking.bookingStatus ?? booking.status);
  const expired = isPaymentExpired(booking, now);
  const utrSubmitted = hasUtrSubmitted(booking);

  if (expired) {
    return utrSubmitted ? "refund" : "cancelled";
  }

  if (bookingSt.includes("cancel")) {
    return "cancelled";
  }

  if (utrSubmitted) {
    return "verifying-payment";
  }

  return "payment-pending";
}

export function getUserBookingStatusLabel(status: UserBookingStatus): string {
  return USER_BOOKING_STATUS_LABELS[status];
}

export function userBookingStatusTone(status: UserBookingStatus): BookingStatusTone {
  switch (status) {
    case "confirmed":
      return "success";
    case "payment-pending":
    case "verifying-payment":
      return "warning";
    case "cancelled":
    case "refund":
      return "danger";
  }
}

export function shouldWatchUserBookingExpiry(
  booking: Booking,
  now = Date.now(),
): boolean {
  const status = resolveUserBookingStatus(booking, now);
  return (
    (status === "payment-pending" || status === "verifying-payment") &&
    Boolean(booking.expiresAt)
  );
}
