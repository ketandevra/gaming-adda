import { getBookingCreatedMs } from "@/lib/bookings/sort";
import { resolveUserBookingStatus } from "@/lib/bookings/user-booking-status";
import type { Booking } from "@/types";

export type AdminStatsPeriod = "today" | "yesterday" | "this-week" | "this-month";

export const ADMIN_STATS_PERIODS: {
  id: AdminStatsPeriod;
  label: string;
}[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this-week", label: "This week" },
  { id: "this-month", label: "This month" },
];

export const DEFAULT_ADMIN_STATS_PERIOD: AdminStatsPeriod = "today";

export interface AdminBookingStats {
  total: number;
  confirmed: number;
  paymentPending: number;
  verifyingPayment: number;
  cancelled: number;
  refund: number;
  revenue: number;
}

export interface AdminStatsDateRange {
  start: Date;
  end: Date;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function getAdminStatsDateRange(
  period: AdminStatsPeriod,
  now = new Date(),
): AdminStatsDateRange {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (period) {
    case "today":
      return { start: todayStart, end: todayEnd };
    case "yesterday": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 1);
      const end = new Date(todayEnd);
      end.setDate(end.getDate() - 1);
      return { start, end };
    }
    case "this-week": {
      const start = new Date(todayStart);
      const weekday = start.getDay();
      const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
      start.setDate(start.getDate() - daysFromMonday);
      return { start, end: todayEnd };
    }
    case "this-month": {
      const start = new Date(todayStart);
      start.setDate(1);
      return { start, end: todayEnd };
    }
  }
}

export function bookingMatchesAdminStatsPeriod(
  booking: Booking,
  range: AdminStatsDateRange,
): boolean {
  const createdMs = getBookingCreatedMs(booking);
  if (!createdMs) return false;
  return createdMs >= range.start.getTime() && createdMs <= range.end.getTime();
}

export function filterBookingsForAdminStatsPeriod(
  bookings: Booking[],
  period: AdminStatsPeriod,
  now = new Date(),
): Booking[] {
  const range = getAdminStatsDateRange(period, now);
  return bookings.filter((booking) => bookingMatchesAdminStatsPeriod(booking, range));
}

const EMPTY_STATS: AdminBookingStats = {
  total: 0,
  confirmed: 0,
  paymentPending: 0,
  verifyingPayment: 0,
  cancelled: 0,
  refund: 0,
  revenue: 0,
};

export function computeAdminBookingStats(
  bookings: Booking[],
  period: AdminStatsPeriod,
  now = new Date(),
): AdminBookingStats {
  const inPeriod = filterBookingsForAdminStatsPeriod(bookings, period, now);
  if (inPeriod.length === 0) return { ...EMPTY_STATS };

  const stats: AdminBookingStats = { ...EMPTY_STATS };

  for (const booking of inPeriod) {
    stats.total += 1;
    const status = resolveUserBookingStatus(booking, now.getTime());

    switch (status) {
      case "confirmed":
        stats.confirmed += 1;
        if (booking.totalAmount != null && booking.totalAmount > 0) {
          stats.revenue += booking.totalAmount;
        }
        break;
      case "payment-pending":
        stats.paymentPending += 1;
        break;
      case "verifying-payment":
        stats.verifyingPayment += 1;
        break;
      case "cancelled":
        stats.cancelled += 1;
        break;
      case "refund":
        stats.refund += 1;
        break;
    }
  }

  return stats;
}

export function getAdminStatsPeriodLabel(period: AdminStatsPeriod): string {
  return ADMIN_STATS_PERIODS.find((item) => item.id === period)?.label ?? "Today";
}
