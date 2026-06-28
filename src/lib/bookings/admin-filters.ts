import { isAdminPendingBooking } from "@/lib/bookings/refund";
import { sortBookingsByCreatedDesc } from "@/lib/bookings/sort";
import type { Booking } from "@/types";

export type AdminBookingFilter = "all" | "pending";

export const ADMIN_BOOKING_FILTERS: {
  id: AdminBookingFilter;
  label: string;
  shortLabel: string;
}[] = [
  { id: "pending", label: "Pending", shortLabel: "Pending" },
  { id: "all", label: "All", shortLabel: "All" },
];

export const DEFAULT_ADMIN_BOOKING_FILTER: AdminBookingFilter = "pending";

/** Reserved + UTR submitted + expiresAt not passed. */
export function isPendingBooking(
  booking: Booking,
  now = Date.now(),
): boolean {
  return isAdminPendingBooking(booking, now);
}

export function bookingMatchesAdminFilter(
  booking: Booking,
  filter: AdminBookingFilter,
  now = Date.now(),
): boolean {
  if (filter === "all") return !isPendingBooking(booking, now);
  return isPendingBooking(booking, now);
}

export function filterAdminBookings(
  bookings: Booking[],
  filter: AdminBookingFilter,
  now = Date.now(),
): Booking[] {
  return bookings.filter((booking) =>
    bookingMatchesAdminFilter(booking, filter, now),
  );
}

export function countAdminBookingsByFilter(
  bookings: Booking[],
  now = Date.now(),
): Record<AdminBookingFilter, number> {
  return ADMIN_BOOKING_FILTERS.reduce(
    (counts, { id }) => {
      counts[id] = filterAdminBookings(bookings, id, now).length;
      return counts;
    },
    {} as Record<AdminBookingFilter, number>,
  );
}

export function sortAdminBookings(bookings: Booking[]): Booking[] {
  return sortBookingsByCreatedDesc(bookings);
}

export function normalizeBookingNumberQuery(query: string): string {
  return query.trim().replace(/^#/, "").toLowerCase();
}

export function filterAdminBookingsByNumber(
  bookings: Booking[],
  query: string,
): Booking[] {
  const normalized = normalizeBookingNumberQuery(query);
  if (!normalized) return bookings;

  return bookings.filter((booking) =>
    booking.id.toLowerCase().includes(normalized),
  );
}

export function filterAdminBookingsForView(
  bookings: Booking[],
  filter: AdminBookingFilter,
  searchQuery: string,
  now = Date.now(),
): Booking[] {
  const normalizedSearch = normalizeBookingNumberQuery(searchQuery);
  const scoped = normalizedSearch
    ? filterAdminBookingsByNumber(bookings, searchQuery)
    : filterAdminBookings(bookings, filter, now);

  return sortAdminBookings(scoped);
}

function normalizeStatusForCheck(value?: string): string {
  return value?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

export function isBookingFullyVerified(booking: Booking): boolean {
  const payment = normalizeStatusForCheck(booking.paymentStatus);
  const bookingSt = normalizeStatusForCheck(booking.bookingStatus);
  const paid =
    payment.includes("paid") ||
    payment.includes("verified") ||
    payment.includes("success");
  const confirmed =
    bookingSt.includes("confirmed") ||
    booking.status === "confirmed" ||
    booking.status === "completed";
  return paid && confirmed;
}

export function adminBookingAwaitingVerification(booking: Booking): boolean {
  return isPendingBooking(booking);
}

export function adminCanVerifyPayment(booking: Booking): boolean {
  return isPendingBooking(booking);
}
