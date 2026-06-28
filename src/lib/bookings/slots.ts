import { getMockSlots } from "@/lib/api/mock-data";
import { parseSlotId } from "@/lib/api/sheets-mappers";
import { shouldUseMockData } from "@/lib/api/config";
import { slotIdBookingDate } from "@/lib/slots/selection";
import { combineDateAndTime } from "@/lib/utils";

export interface ResolvedSlot {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  price?: number;
}

export function resolveSlotDetails(
  consoleId: string,
  slotId: string,
  hourlyRate = 0,
): ResolvedSlot | null {
  const parsed = parseSlotId(slotId);
  if (parsed) {
    return {
      slotId,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
    };
  }

  const date = slotIdBookingDate(slotId);
  if (!date) return null;

  if (shouldUseMockData()) {
    const slot = getMockSlots(consoleId, date).find((s) => s.id === slotId);
    if (slot) {
      return {
        slotId,
        date,
        startTime: slot.startTime.includes("T")
          ? slot.startTime.split("T")[1]!.slice(0, 5)
          : slot.startTime,
        endTime: slot.endTime.includes("T")
          ? slot.endTime.split("T")[1]!.slice(0, 5)
          : slot.endTime,
        price: slot.price,
      };
    }
  }

  const mockMatch = slotId.match(/-(\d{4}-\d{2}-\d{2})-(\d+)$/);
  if (mockMatch) {
    const hour = Number(mockMatch[2]);
    const start = `${String(hour).padStart(2, "0")}:00`;
    const endHour = hour === 23 ? 0 : hour + 1;
    const end = `${String(endHour).padStart(2, "0")}:00`;
    return {
      slotId,
      date: mockMatch[1]!,
      startTime: start,
      endTime: end,
      price: hourlyRate || undefined,
    };
  }

  return null;
}

export function resolveSlotsForBooking(
  consoleId: string,
  slotIds: string[],
  hourlyRate = 0,
): ResolvedSlot[] {
  return slotIds
    .map((id) => resolveSlotDetails(consoleId, id, hourlyRate))
    .filter((s): s is ResolvedSlot => s != null)
    .sort((a, b) => {
      const aMs = new Date(combineDateAndTime(a.date, a.startTime)).getTime();
      const bMs = new Date(combineDateAndTime(b.date, b.startTime)).getTime();
      return aMs - bMs;
    });
}

export function sumResolvedSlotPrices(
  slots: ResolvedSlot[],
  hourlyRate: number,
): number {
  return slots.reduce((sum, slot) => sum + (slot.price ?? hourlyRate), 0);
}
