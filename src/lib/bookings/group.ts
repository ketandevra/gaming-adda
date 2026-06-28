import { parseSlotId } from "@/lib/api/sheets-mappers";
import { getBookingCreatedMs, sortBookingsByCreatedDesc } from "@/lib/bookings/sort";
import { getBookingSessionEnd, getBookingSessionStart } from "@/lib/bookings/timing";
import { formatBookingTimeRange } from "@/lib/utils";
import type { Booking } from "@/types";

export interface BookingSlotLine {
  startTime: string;
  endTime: string;
  label: string;
}

function bookingCreatedMs(booking: Booking): number {
  return getBookingCreatedMs(booking);
}

function sameGroupKey(a: Booking, b: Booking): boolean {
  return (
    a.consoleId === b.consoleId &&
    a.bookingDate === b.bookingDate &&
    a.customerPhone === b.customerPhone &&
    (a.bookingStatus ?? a.status) === (b.bookingStatus ?? b.status) &&
    (a.paymentStatus ?? "") === (b.paymentStatus ?? "")
  );
}

function slotsAreBackToBack(a: Booking, b: Booking): boolean {
  const aEnd = getBookingSessionEnd(a)?.getTime();
  const bStart = getBookingSessionStart(b)?.getTime();
  if (aEnd == null || bStart == null) return false;
  return Math.abs(bStart - aEnd) < 60_000;
}

function createdCloseTogether(a: Booking, b: Booking): boolean {
  const aMs = bookingCreatedMs(a);
  const bMs = bookingCreatedMs(b);
  if (!aMs || !bMs) return true;
  return Math.abs(aMs - bMs) <= 5 * 60_000;
}

function mergeTwoBookings(primary: Booking, next: Booking): Booking {
  const slotIds = [
    ...(primary.slotIds?.length ? primary.slotIds : [primary.slotId]),
    ...(next.slotIds?.length ? next.slotIds : [next.slotId]),
  ];

  const bookingIds = [
    ...(primary.bookingIds?.length ? primary.bookingIds : [primary.id]),
    ...(next.bookingIds?.length ? next.bookingIds : [next.id]),
  ];

  const endBooking =
    (getBookingSessionEnd(primary)?.getTime() ?? 0) >=
    (getBookingSessionEnd(next)?.getTime() ?? 0)
      ? primary
      : next;
  const startBooking =
    (getBookingSessionStart(primary)?.getTime() ?? Number.MAX_SAFE_INTEGER) <=
    (getBookingSessionStart(next)?.getTime() ?? Number.MAX_SAFE_INTEGER)
      ? primary
      : next;

  return {
    ...primary,
    id: primary.id,
    slotId: primary.slotId,
    slotIds,
    bookingIds,
    startTime: startBooking.startTime,
    endTime: endBooking.endTime,
    totalAmount:
      (primary.totalAmount ?? 0) + (next.totalAmount ?? 0) || undefined,
    expiresAt: primary.expiresAt ?? next.expiresAt,
    createdAt: primary.createdAt ?? next.createdAt,
  };
}

/** Merge consecutive bookings from the same checkout into one display row. */
export function groupBookingsForDisplay(bookings: Booking[]): Booking[] {
  if (bookings.length <= 1) return bookings;

  const sorted = [...bookings].sort((a, b) => {
    const aStart = getBookingSessionStart(a)?.getTime() ?? 0;
    const bStart = getBookingSessionStart(b)?.getTime() ?? 0;
    return aStart - bStart;
  });

  const grouped: Booking[] = [];

  for (const booking of sorted) {
    const last = grouped[grouped.length - 1];
    if (
      last &&
      sameGroupKey(last, booking) &&
      createdCloseTogether(last, booking) &&
      slotsAreBackToBack(last, booking)
    ) {
      grouped[grouped.length - 1] = mergeTwoBookings(last, booking);
    } else {
      grouped.push({ ...booking });
    }
  }

  return sortBookingsByCreatedDesc(grouped);
}

export function getBookingSlotCount(booking: Booking): number {
  if (booking.slotIds?.length) return booking.slotIds.length;
  return 1;
}

export function getBookingSlotLines(booking: Booking): BookingSlotLine[] {
  const ids =
    booking.slotIds?.length && booking.slotIds.length > 0
      ? booking.slotIds
      : [booking.slotId];

  const lines: BookingSlotLine[] = [];

  for (const slotId of ids) {
    if (!slotId) continue;
    const parsed = parseSlotId(slotId);
    if (parsed) {
      lines.push({
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        label: formatBookingTimeRange(parsed.startTime, parsed.endTime),
      });
      continue;
    }

    if (booking.bookingDate && booking.startTime && booking.endTime && lines.length === 0) {
      lines.push({
        startTime: booking.startTime,
        endTime: booking.endTime,
        label: formatBookingTimeRange(booking.startTime, booking.endTime),
      });
    }
  }

  if (lines.length === 0 && booking.startTime && booking.endTime) {
    lines.push({
      startTime: booking.startTime,
      endTime: booking.endTime,
      label: formatBookingTimeRange(booking.startTime, booking.endTime),
    });
  }

  return lines;
}

export function getCombinedTimeLabel(booking: Booking): string {
  const lines = getBookingSlotLines(booking);
  if (lines.length <= 1) {
    return lines[0]?.label ?? formatBookingTimeRange(booking.startTime, booking.endTime);
  }

  const first = lines[0]!;
  const last = lines[lines.length - 1]!;
  return `${formatBookingTimeRange(first.startTime, first.endTime).split(" – ")[0]} – ${formatBookingTimeRange(last.startTime, last.endTime).split(" – ")[1] ?? formatBookingTimeRange(last.startTime, last.endTime)}`;
}

export function getRelatedBookingIds(booking: Booking): string[] {
  if (booking.bookingIds?.length) return booking.bookingIds;
  return [booking.id];
}
