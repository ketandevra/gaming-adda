import { combineDateAndTime, parseBookingSlotId, toDateInputValue } from "@/lib/utils";
import type { TimeSlot } from "@/types";

function isTimeOnly(value: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim());
}

/** Start datetime for a slot (from slot id or ISO startTime). */
export function getSlotStart(slot: TimeSlot): Date | null {
  const parsed = parseBookingSlotId(slot.id);
  if (parsed?.date) {
    const d = new Date(combineDateAndTime(parsed.date, parsed.startTime));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (slot.startTime && !isTimeOnly(slot.startTime)) {
    const d = new Date(slot.startTime);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

/** True if the slot start is strictly after now (bookable). */
export function isFutureSlot(slot: TimeSlot, now = Date.now()): boolean {
  const start = getSlotStart(slot);
  if (!start) return true;
  return start.getTime() > now;
}

export function filterFutureSlots(
  slots: TimeSlot[],
  now = Date.now(),
): TimeSlot[] {
  return slots.filter((slot) => isFutureSlot(slot, now));
}

export function isDateBeforeToday(date: string): boolean {
  return date < toDateInputValue(new Date());
}

export function isDateToday(date: string): boolean {
  return date === toDateInputValue(new Date());
}
