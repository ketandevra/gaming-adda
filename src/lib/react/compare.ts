import type { Booking, GameConsole } from "@/types";

/** Shallow compare for memoized booking list items. */
export function areBookingsEqual(a: Booking, b: Booking): boolean {
  return (
    a.id === b.id &&
    a.bookingStatus === b.bookingStatus &&
    a.paymentStatus === b.paymentStatus &&
    a.expiresAt === b.expiresAt &&
    a.status === b.status &&
    a.customerName === b.customerName &&
    a.consoleName === b.consoleName &&
    a.bookingDate === b.bookingDate &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.totalAmount === b.totalAmount &&
    a.bookedAt === b.bookedAt &&
    a.notes === b.notes
  );
}

export function areConsolesEqual(a: GameConsole, b: GameConsole): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.hourlyRate === b.hourlyRate &&
    a.platform === b.platform &&
    a.description === b.description &&
    a.isActive === b.isActive &&
    a.maxPlayers === b.maxPlayers
  );
}
