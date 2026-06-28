import type { Booking } from "@/types";

export function getBookingCreatedMs(booking: Booking): number {
  const raw = booking.createdAt ?? booking.bookedAt;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Newest bookings first (by createdAt, then id). */
export function sortBookingsByCreatedDesc(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    const diff = getBookingCreatedMs(b) - getBookingCreatedMs(a);
    if (diff !== 0) return diff;
    return b.id.localeCompare(a.id);
  });
}
