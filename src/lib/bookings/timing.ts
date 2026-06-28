import { sortBookingsByCreatedDesc } from "@/lib/bookings/sort";
import {
  combineDateAndTime,
  isValidBookingDate,
  parseBookingSlotId,
} from "@/lib/utils";
import type { Booking } from "@/types";

function isTimeOnly(value: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim());
}

function parseSessionDate(date: string, time: string): Date | null {
  const iso = combineDateAndTime(date, time);
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getBookingSessionEnd(booking: Booking): Date | null {
  if (booking.bookingDate && isValidBookingDate(booking.bookingDate)) {
    return parseSessionDate(booking.bookingDate, booking.endTime);
  }

  const slot = booking.slotId ? parseBookingSlotId(booking.slotId) : null;
  if (slot?.date && isValidBookingDate(slot.date)) {
    return parseSessionDate(slot.date, slot.endTime);
  }

  if (booking.endTime && !isTimeOnly(booking.endTime)) {
    const d = new Date(booking.endTime);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2000) return d;
  }

  return null;
}

export function getBookingSessionStart(booking: Booking): Date | null {
  if (booking.bookingDate && isValidBookingDate(booking.bookingDate)) {
    return parseSessionDate(booking.bookingDate, booking.startTime);
  }

  const slot = booking.slotId ? parseBookingSlotId(booking.slotId) : null;
  if (slot?.date && isValidBookingDate(slot.date)) {
    return parseSessionDate(slot.date, slot.startTime);
  }

  if (booking.startTime && !isTimeOnly(booking.startTime)) {
    const d = new Date(booking.startTime);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2000) return d;
  }

  return null;
}

function statusText(booking: Booking): string {
  return `${booking.bookingStatus ?? ""} ${booking.status}`.toLowerCase();
}

/** Past tab: session ended, expired, cancelled, or completed. */
export function isPastBooking(booking: Booking, now = Date.now()): boolean {
  const text = statusText(booking);

  if (text.includes("expired")) return true;
  if (text.includes("cancel")) return true;
  if (booking.status === "cancelled" || booking.status === "completed") {
    return true;
  }

  const sessionEnd = getBookingSessionEnd(booking);
  if (sessionEnd) return sessionEnd.getTime() < now;

  return false;
}

export function isUpcomingBooking(booking: Booking, now = Date.now()): boolean {
  return !isPastBooking(booking, now);
}

export function partitionBookings(bookings: Booking[]): {
  upcoming: Booking[];
  past: Booking[];
} {
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  for (const booking of bookings) {
    if (isPastBooking(booking)) {
      past.push(booking);
    } else {
      upcoming.push(booking);
    }
  }

  return {
    upcoming: sortBookingsByCreatedDesc(upcoming),
    past: sortBookingsByCreatedDesc(past),
  };
}
