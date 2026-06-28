/** Green = confirmed/paid, Yellow = pending/reserved, Red = cancelled/not paid */
export type BookingStatusTone = "success" | "warning" | "danger" | "neutral";

export const STATUS_BADGE_CLASS: Record<BookingStatusTone, string> = {
  success: "status-badge-success",
  warning: "status-badge-warning",
  danger: "status-badge-danger",
  neutral: "status-badge-neutral",
};

function normalizeStatus(value?: string): string {
  return value?.trim().toLowerCase().replace(/_/g, " ") ?? "";
}

export function resolveStatusTone(raw: string): BookingStatusTone {
  const s = normalizeStatus(raw);

  if (
    s.includes("cancel") ||
    s.includes("not paid") ||
    s.includes("unpaid") ||
    s.includes("fail") ||
    s.includes("reject") ||
    s.includes("expir") ||
    s.includes("declin")
  ) {
    return "danger";
  }

  if (
    s.includes("pending") ||
    s.includes("reserved") ||
    s.includes("await") ||
    s.includes("submit") ||
    s.includes("hold")
  ) {
    return "warning";
  }

  if (
    s.includes("confirm") ||
    s.includes("complete") ||
    s.includes("paid") ||
    s.includes("verified") ||
    s.includes("success")
  ) {
    return "success";
  }

  return "neutral";
}

export function bookingStatusTone(booking: {
  bookingStatus?: string;
  status: string;
}): BookingStatusTone {
  const raw = booking.bookingStatus?.trim() || booking.status;
  return resolveStatusTone(raw);
}

export function paymentStatusTone(paymentStatus?: string): BookingStatusTone {
  if (!paymentStatus?.trim()) return "neutral";
  return resolveStatusTone(paymentStatus);
}
