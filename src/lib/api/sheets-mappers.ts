import { parseExpiresAt } from "@/lib/bookings/payment-expiry";
import { normalizeMobile } from "@/lib/auth/mobile";
import { combineDateAndTime, isValidBookingDate } from "@/lib/utils";
import type { ConsolePlatform, GameConsole, TimeSlot, Booking, BookingStatus } from "@/types";
import type {
  SheetsAvailableSlot,
  SheetsBooking,
  SheetsConsoleType,
} from "./sheets-types";

export function inferPlatform(name: string): ConsolePlatform {
  const n = name.toLowerCase();
  if (n.includes("playstation") || n.includes("ps5") || n.includes("ps4")) {
    return "playstation";
  }
  if (n.includes("xbox")) return "xbox";
  if (n.includes("nintendo") || n.includes("switch")) return "nintendo";
  if (n.includes("vr")) return "vr";
  if (n.includes("pc")) return "pc";
  return "other";
}

export function mapConsoleType(row: SheetsConsoleType): GameConsole {
  return {
    id: String(row.id),
    name: row.name,
    platform: inferPlatform(row.name),
    hourlyRate: row.pricePerHour,
    maxPlayers: 2,
    isActive: true,
  };
}

export function buildSlotId(
  consoleId: string,
  date: string,
  startTime: string,
  endTime: string,
): string {
  return `${consoleId}|${date}|${startTime}|${endTime}`;
}

export function parseSlotId(slotId: string): {
  consoleId: string;
  date: string;
  startTime: string;
  endTime: string;
} | null {
  const parts = slotId.split("|");
  if (parts.length !== 4) return null;
  const [consoleId, date, startTime, endTime] = parts;
  return { consoleId, date, startTime, endTime };
}

export function mapAvailableSlot(
  consoleId: string,
  date: string,
  row: SheetsAvailableSlot,
  hourlyRate: number,
): TimeSlot {
  const available =
    row.available === true || (row.remaining ?? 0) > 0;

  return {
    id: buildSlotId(consoleId, date, row.startTime, row.endTime),
    consoleId,
    startTime: combineDateAndTime(date, row.startTime),
    endTime: combineDateAndTime(date, row.endTime),
    isAvailable: available,
    price: hourlyRate,
  };
}

const VALID_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

function parseBookingStatus(raw?: string): {
  status: BookingStatus;
  bookedAt?: string;
} {
  if (!raw?.trim()) return { status: "confirmed" };

  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (VALID_STATUSES.includes(lower as BookingStatus)) {
    return { status: lower as BookingStatus };
  }

  // Google Sheets may return a datetime in the status column
  if (trimmed.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2000) {
      return { status: "confirmed", bookedAt: trimmed };
    }
  }

  return { status: "confirmed" };
}

export function mapSheetsBooking(row: SheetsBooking): Booking {
  const id = String(row.bookingId ?? row.id ?? "");
  const consoleId = String(row.consoleTypeId ?? row.consoleId ?? "");
  const rawDate = row.bookingDate ?? row.date ?? "";
  const bookingDate = isValidBookingDate(rawDate) ? rawDate : undefined;
  const startTime = row.startTime ?? "";
  const endTime = row.endTime ?? "";

  const slotId =
    bookingDate && startTime && endTime
      ? buildSlotId(consoleId, bookingDate, startTime, endTime)
      : "";

  const bookingStatusRaw = row.bookingStatus?.trim();
  const paymentStatus = row.paymentStatus?.trim() || undefined;

  const statusSource =
    bookingStatusRaw && !looksLikeIsoTimestamp(bookingStatusRaw)
      ? bookingStatusRaw
      : row.status;

  const { status, bookedAt } = parseBookingStatus(statusSource);

  const totalAmount = row.totalAmount ?? row.price;

  return {
    id,
    consoleId,
    consoleName: row.consoleName,
    slotId,
    customerName: row.customerName ?? row.name ?? "",
    customerEmail: row.customerEmail ?? row.email,
    customerPhone: normalizeMobile(
      row.customerPhone ?? row.mobile ?? row.phone ?? "",
    ),
    bookingDate,
    startTime,
    endTime,
    totalAmount: totalAmount != null ? Number(totalAmount) : undefined,
    bookingStatus: bookingStatusRaw || undefined,
    paymentStatus,
    expiresAt: parseExpiresAt(row.expiresAt ?? row.expiresAT),
    status,
    bookedAt,
    createdAt: row.createdAt,
    notes: row.notes,
  };
}

function looksLikeIsoTimestamp(value: string): boolean {
  return value.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(value);
}
