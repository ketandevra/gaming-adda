import { parseBookingSlotId } from "@/lib/utils";
import type { TimeSlot } from "@/types";

/** Sort slots chronologically by start time. */
export function sortSlotsByTime(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export function sumSlotPrices(
  slots: TimeSlot[],
  fallbackRate: number,
): number {
  return slots.reduce(
    (sum, slot) => sum + (slot.price ?? fallbackRate),
    0,
  );
}

export function formatSlotTimeRange(slot: TimeSlot): string {
  const start = new Date(slot.startTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = new Date(slot.endTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

/** Extract booking date from pipe-style or mock-style slot ids. */
export function slotIdBookingDate(slotId: string): string | null {
  const parsed = parseBookingSlotId(slotId);
  if (parsed) return parsed.date;

  const mockMatch = slotId.match(/-(\d{4}-\d{2}-\d{2})-\d+$/);
  return mockMatch?.[1] ?? null;
}

export function toggleSlotSelection(
  selectedIds: string[],
  slotId: string,
): string[] {
  if (selectedIds.includes(slotId)) {
    return selectedIds.filter((id) => id !== slotId);
  }
  return [...selectedIds, slotId];
}

export function selectedSlotsFromIds(
  slots: TimeSlot[],
  selectedIds: string[],
): TimeSlot[] {
  const byId = new Map(slots.map((s) => [s.id, s]));
  return sortSlotsByTime(
    selectedIds
      .map((id) => byId.get(id))
      .filter((s): s is TimeSlot => s != null),
  );
}
