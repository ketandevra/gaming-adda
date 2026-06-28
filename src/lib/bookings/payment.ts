import { getBookingSlotCount } from "@/lib/bookings/group";
import type { Booking, GameConsole } from "@/types";

function normalizeStatus(value?: string): string {
  return value?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

function isPaidOrSubmitted(status: string): boolean {
  return (
    status.includes("paid") ||
    status.includes("verified") ||
    status.includes("success") ||
    status.includes("submit")
  );
}

function isUnpaidStatus(status: string): boolean {
  if (!status) return false;
  if (isPaidOrSubmitted(status)) return false;

  return (
    status.includes("pending") ||
    status.includes("not paid") ||
    status.includes("unpaid") ||
    status.includes("await") ||
    status.includes("reserved") ||
    status.includes("payment required")
  );
}

function isCancelledOrExpired(booking: Booking): boolean {
  const payment = normalizeStatus(booking.paymentStatus);
  const bookingSt = normalizeStatus(booking.bookingStatus);
  const combined = `${payment} ${bookingSt} ${booking.status}`;

  return (
    combined.includes("cancel") ||
    combined.includes("expir") ||
    combined.includes("declin")
  );
}

function hasActivePaymentWindow(booking: Booking, now = Date.now()): boolean {
  if (!booking.expiresAt) return false;
  const expiryMs = new Date(booking.expiresAt).getTime();
  return !Number.isNaN(expiryMs) && expiryMs > now;
}

/** Whether the booking still needs UPI payment / UTR submission. */
export function bookingNeedsPayment(booking: Booking, now = Date.now()): boolean {
  if (isCancelledOrExpired(booking)) return false;

  const payment = normalizeStatus(booking.paymentStatus);
  const bookingSt = normalizeStatus(booking.bookingStatus);

  if (isPaidOrSubmitted(payment) || isPaidOrSubmitted(bookingSt)) {
    return false;
  }

  if (isUnpaidStatus(payment) || isUnpaidStatus(bookingSt)) {
    return true;
  }

  if (hasActivePaymentWindow(booking, now)) {
    return true;
  }

  return false;
}

/** UTR submitted — payment is being verified (not yet paid/confirmed). */
export function isPaymentVerifying(paymentStatus?: string): boolean {
  const raw = normalizeStatus(paymentStatus);
  if (!raw) return false;
  if (raw.includes("paid") || raw.includes("verified") || raw.includes("success")) {
    return false;
  }
  return raw.includes("submit") || (raw.includes("utr") && raw.includes("verif"));
}

export function formatPaymentStatusLabel(paymentStatus?: string): string | null {
  if (!paymentStatus?.trim()) return null;
  if (isPaymentVerifying(paymentStatus)) return "Verifying Payment";
  return paymentStatus.trim().replace(/_/g, " ");
}

export function resolveBookingPaymentAmount(
  booking: Booking,
  consolesById: Map<string, GameConsole>,
): number {
  if (booking.totalAmount != null && booking.totalAmount > 0) {
    return booking.totalAmount;
  }

  const hourlyRate = consolesById.get(booking.consoleId)?.hourlyRate ?? 0;
  if (hourlyRate <= 0) return 0;

  return getBookingSlotCount(booking) * hourlyRate;
}

export function enrichBookingPaymentAmounts(
  bookings: Booking[],
  consoles: GameConsole[],
): Booking[] {
  const consolesById = new Map(consoles.map((console_) => [console_.id, console_]));

  return bookings.map((booking) => {
    const amount = resolveBookingPaymentAmount(booking, consolesById);
    if (amount <= 0 || (booking.totalAmount != null && booking.totalAmount > 0)) {
      return booking;
    }
    return { ...booking, totalAmount: amount };
  });
}
