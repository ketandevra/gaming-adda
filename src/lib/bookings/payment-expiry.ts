import { bookingNeedsPayment } from "@/lib/bookings/payment";
import type { Booking } from "@/types";

/** Parse API expiry field (supports expiresAt / expiresAT naming). */
export function parseExpiresAt(
  raw?: string | null,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const d = new Date(raw.trim());
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "00:00";

  const totalSec = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getPaymentExpiryState(
  expiresAt: string | undefined,
  now = Date.now(),
): {
  remainingMs: number;
  isExpired: boolean;
  label: string;
} | null {
  if (!expiresAt) return null;

  const expiryMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryMs)) return null;

  const remainingMs = expiryMs - now;
  const isExpired = remainingMs <= 0;

  return {
    remainingMs: Math.max(0, remainingMs),
    isExpired,
    label: isExpired ? "00:00" : formatCountdown(remainingMs),
  };
}

/** Show countdown while payment is pending and UTR not yet submitted. */
export function shouldShowPaymentCountdown(booking: Booking): boolean {
  return bookingNeedsPayment(booking) && Boolean(booking.expiresAt);
}
