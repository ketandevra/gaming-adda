import { enrichConsoleWithImage } from "@/lib/console-images";
import {
  resolveSlotsForBooking,
  sumResolvedSlotPrices,
} from "@/lib/bookings/slots";
import { cache } from "react";
import { isSheetsApi, shouldUseMockData } from "./config";
import {
  createMockBooking,
  ensureMockAdminSampleBookings,
  getAllMockBookings,
  getMockBooking,
  getMockBookingsByContact,
  getMockConsole,
  getMockConsoles,
  getMockSlots,
  verifyMockBookingPayment,
} from "./mock-data";
import {
  invalidateAllBookingsCache,
  invalidateBookingsCache,
  sheetsCreateBooking,
  sheetsFetchAllBookings,
  sheetsFetchBooking,
  sheetsFetchBookings,
  sheetsFetchConsole,
  sheetsFetchConsoles,
  sheetsFetchSlots,
  sheetsSubmitUtr,
  sheetsVerifyBookingPayment,
} from "./sheets-client";
import type {
  Booking,
  CreateBookingPayload,
  GameConsole,
  SubmitBookingUtrPayload,
  TimeSlot,
  VerifyBookingPaymentPayload,
} from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getConsolesCached = cache(async (): Promise<GameConsole[]> => {
  if (shouldUseMockData()) return getMockConsoles().map(enrichConsoleWithImage);
  if (isSheetsApi()) return sheetsFetchConsoles();
  throw new ApiError("API not configured for REST mode", 500);
});

export async function fetchConsoles(): Promise<GameConsole[]> {
  return getConsolesCached();
}

export async function fetchConsole(id: string): Promise<GameConsole | null> {
  if (shouldUseMockData()) {
    const console_ = getMockConsole(id);
    return console_ ? enrichConsoleWithImage(console_) : null;
  }
  if (isSheetsApi()) return sheetsFetchConsole(id);
  throw new ApiError("API not configured for REST mode", 500);
}

export async function fetchSlots(
  consoleId: string,
  date: string,
  hourlyRate?: number,
): Promise<TimeSlot[]> {
  if (shouldUseMockData()) return getMockSlots(consoleId, date);
  if (isSheetsApi()) return sheetsFetchSlots(consoleId, date, hourlyRate);
  throw new ApiError("API not configured for REST mode", 500);
}

async function createMergedBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  if (payload.slotIds.length === 0) {
    throw new ApiError("No slots selected", 400);
  }

  const mockConsole = shouldUseMockData()
    ? getMockConsole(payload.consoleId)
    : null;
  const hourlyRate = mockConsole?.hourlyRate ?? 0;

  const resolved = resolveSlotsForBooking(
    payload.consoleId,
    payload.slotIds,
    hourlyRate,
  );
  if (resolved.length === 0) {
    throw new ApiError("Invalid slot selection", 400);
  }

  const first = resolved[0]!;
  const last = resolved[resolved.length - 1]!;
  const totalAmount = sumResolvedSlotPrices(resolved, hourlyRate);
  const slotIds = payload.slotIds;

  if (shouldUseMockData()) {
    const booking = createMockBooking({
      consoleId: payload.consoleId,
      consoleName: mockConsole?.name,
      slotId: slotIds[0]!,
      slotIds,
      customerName: payload.customerName,
      customerEmail:
        payload.customerEmail ?? `${payload.mobile}@gaming-adda.local`,
      customerPhone: payload.mobile,
      bookingDate: first.date,
      startTime: first.startTime,
      endTime: last.endTime,
      totalAmount,
      notes:
        payload.notes ??
        (slotIds.length > 1 ? `${slotIds.length} slots` : undefined),
    });
    return booking;
  }

  if (isSheetsApi()) {
    return sheetsCreateBooking(payload);
  }

  throw new ApiError("API not configured for REST mode", 500);
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const booking = await createMergedBooking(payload);
  if (shouldUseMockData() || isSheetsApi()) {
    invalidateBookingsCache(payload.mobile);
  }
  return booking;
}

export async function createBookings(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const booking = await createMergedBooking(payload);
  if (shouldUseMockData() || isSheetsApi()) {
    invalidateBookingsCache(payload.mobile);
  }
  return booking;
}

export async function fetchBookings(
  params: { mobile?: string },
  options?: { force?: boolean },
): Promise<Booking[]> {
  if (shouldUseMockData()) {
    return getMockBookingsByContact(undefined, params.mobile);
  }
  if (isSheetsApi()) {
    if (options?.force && params.mobile) {
      invalidateBookingsCache(params.mobile);
    }
    return sheetsFetchBookings(params);
  }
  throw new ApiError("API not configured for REST mode", 500);
}

export async function fetchBooking(id: string): Promise<Booking | null> {
  if (shouldUseMockData()) return getMockBooking(id) ?? null;
  if (isSheetsApi()) return sheetsFetchBooking(id);
  throw new ApiError("API not configured for REST mode", 500);
}

export async function submitBookingUtr(
  payload: SubmitBookingUtrPayload,
): Promise<void> {
  if (shouldUseMockData()) {
    const booking = getMockBooking(payload.bookingId);
    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }
    booking.paymentStatus = "Utr Submitted";
    if (payload.mobile) invalidateBookingsCache(payload.mobile);
    return;
  }

  if (isSheetsApi()) {
    return sheetsSubmitUtr(payload);
  }

  throw new ApiError("API not configured for REST mode", 500);
}

export async function fetchAllBookings(
  options?: { force?: boolean },
): Promise<Booking[]> {
  if (shouldUseMockData()) {
    ensureMockAdminSampleBookings();
    return getAllMockBookings();
  }
  if (isSheetsApi()) {
    if (options?.force) invalidateAllBookingsCache();
    return sheetsFetchAllBookings();
  }
  throw new ApiError("API not configured for REST mode", 500);
}

export async function verifyBookingPayment(
  payload: VerifyBookingPaymentPayload,
): Promise<void> {
  if (shouldUseMockData()) {
    const updated = verifyMockBookingPayment(payload.bookingId);
    if (!updated) throw new ApiError("Booking not found", 404);
    invalidateAllBookingsCache();
    if (updated.customerPhone) invalidateBookingsCache(updated.customerPhone);
    return;
  }
  if (isSheetsApi()) {
    await sheetsVerifyBookingPayment(payload);
    invalidateAllBookingsCache();
    if (payload.customerPhone) invalidateBookingsCache(payload.customerPhone);
    return;
  }
  throw new ApiError("API not configured for REST mode", 500);
}

export { ApiError };
