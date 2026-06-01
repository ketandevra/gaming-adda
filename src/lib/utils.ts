import type { Booking, BookingStatus, ConsolePlatform } from "@/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isTimeOnly(value: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim());
}

function toDate(value: string): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (isTimeOnly(trimmed)) {
    const parts = trimmed.split(":").map(Number);
    const d = new Date();
    d.setHours(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, 0);
    return d;
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function combineDateAndTime(date: string, time: string): string {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalized}`;
}

export function parseBookingSlotId(slotId: string): {
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

export function formatTime(value: string): string {
  const d = toDate(value);
  if (!d) return value?.trim() || "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDate(value: string): string {
  if (!value?.trim() || isTimeOnly(value)) return "—";

  const d = toDate(value);
  if (!d) return value;

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(value: string): string {
  if (!value?.trim()) return "—";
  if (isTimeOnly(value)) return formatTime(value);

  const d = toDate(value);
  if (!d) return value;

  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function isValidBookingDate(date?: string): boolean {
  if (!date?.trim()) return false;
  const d = new Date(date.includes("T") ? date : `${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() >= 2000;
}

export function formatBookingTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

export function formatBookingCardDate(booking: Pick<Booking, "bookingDate" | "startTime" | "endTime" | "slotId">): string {
  if (booking.bookingDate && isValidBookingDate(booking.bookingDate)) {
    const startIso = combineDateAndTime(booking.bookingDate, booking.startTime);
    return formatDate(startIso);
  }

  const slot = booking.slotId ? parseBookingSlotId(booking.slotId) : null;
  if (slot?.date && isValidBookingDate(slot.date)) {
    return formatDate(combineDateAndTime(slot.date, slot.startTime));
  }

  return "—";
}

export function formatBookingSession(
  booking: Pick<Booking, "startTime" | "endTime" | "slotId" | "bookingDate">,
): string {
  if (booking.bookingDate && isValidBookingDate(booking.bookingDate)) {
    const startIso = combineDateAndTime(booking.bookingDate, booking.startTime);
    const endIso = combineDateAndTime(booking.bookingDate, booking.endTime);
    return `${formatDate(startIso)} · ${formatTime(startIso)} – ${formatTime(endIso)}`;
  }

  const slot = booking.slotId ? parseBookingSlotId(booking.slotId) : null;

  if (slot?.date && isValidBookingDate(slot.date)) {
    const startIso = combineDateAndTime(slot.date, slot.startTime);
    const endIso = combineDateAndTime(slot.date, slot.endTime);
    return `${formatDate(startIso)} · ${formatTime(startIso)} – ${formatTime(endIso)}`;
  }

  const start = toDate(booking.startTime);
  const end = toDate(booking.endTime);

  if (start && end) {
    if (isTimeOnly(booking.startTime) || isTimeOnly(booking.endTime)) {
      return `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`;
    }
    return `${formatDateTime(booking.startTime)} – ${formatTime(booking.endTime)}`;
  }

  return `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function platformLabel(platform: ConsolePlatform): string {
  const labels: Record<ConsolePlatform, string> = {
    playstation: "PlayStation",
    xbox: "Xbox",
    nintendo: "Nintendo",
    pc: "PC Gaming",
    vr: "VR",
    other: "Gaming",
  };
  return labels[platform];
}

export function statusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  return labels[status];
}

/** Human-readable label for API string statuses (e.g. bookingStatus, paymentStatus). */
export function formatApiStatus(value?: string): string {
  if (!value?.trim()) return "—";
  return value.trim().replace(/_/g, " ");
}

export function isPaymentPending(paymentStatus?: string): boolean {
  return paymentStatus?.trim().toLowerCase() === "pending";
}

export function bookingDisplayStatus(booking: {
  bookingStatus?: string;
  status: BookingStatus;
}): string {
  if (booking.bookingStatus?.trim()) {
    return formatApiStatus(booking.bookingStatus);
  }
  return statusLabel(booking.status);
}

export function bookingStatusBadgeVariant(
  booking: { bookingStatus?: string; status: BookingStatus },
): "default" | "accent" | "success" | "warning" {
  const raw = (booking.bookingStatus ?? booking.status).toLowerCase();
  if (raw.includes("cancel")) return "default";
  if (raw.includes("pending") || raw.includes("await")) return "warning";
  if (raw.includes("confirm") || raw.includes("complete") || raw.includes("paid")) {
    return "success";
  }
  return "accent";
}

export function paymentStatusBadgeVariant(
  paymentStatus?: string,
): "default" | "accent" | "success" | "warning" {
  const raw = paymentStatus?.trim().toLowerCase() ?? "";
  if (!raw) return "default";
  if (raw === "pending") return "warning";
  if (raw.includes("paid") || raw.includes("success") || raw.includes("verified")) {
    return "success";
  }
  if (raw.includes("fail") || raw.includes("reject")) return "default";
  return "accent";
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
