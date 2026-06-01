import { cache } from "react";
import { isSheetsApi, shouldUseMockData } from "./config";
import {
  createMockBooking,
  getMockBooking,
  getMockBookingsByContact,
  getMockConsole,
  getMockConsoles,
  getMockSlots,
} from "./mock-data";
import {
  invalidateBookingsCache,
  sheetsCreateBooking,
  sheetsFetchBooking,
  sheetsFetchBookings,
  sheetsFetchConsole,
  sheetsFetchConsoles,
  sheetsFetchSlots,
  sheetsSubmitUtr,
} from "./sheets-client";
import type {
  Booking,
  CreateBookingPayload,
  GameConsole,
  SubmitBookingUtrPayload,
  TimeSlot,
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
  if (shouldUseMockData()) return getMockConsoles();
  if (isSheetsApi()) return sheetsFetchConsoles();
  throw new ApiError("API not configured for REST mode", 500);
});

export async function fetchConsoles(): Promise<GameConsole[]> {
  return getConsolesCached();
}

export async function fetchConsole(id: string): Promise<GameConsole | null> {
  if (shouldUseMockData()) return getMockConsole(id) ?? null;
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

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  if (shouldUseMockData()) {
    const console_ = getMockConsole(payload.consoleId);
    const slots = getMockSlots(
      payload.consoleId,
      new Date().toISOString().slice(0, 10),
    );
    const slot = slots.find((s) => s.id === payload.slotId);

    const booking = createMockBooking({
      consoleId: payload.consoleId,
      consoleName: console_?.name,
      slotId: payload.slotId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail ?? `${payload.mobile}@gaming-adda.local`,
      customerPhone: payload.mobile,
      startTime: slot?.startTime ?? new Date().toISOString(),
      endTime: slot?.endTime ?? new Date().toISOString(),
      totalAmount: slot?.price ?? console_?.hourlyRate ?? 0,
      notes: payload.notes,
    });
    invalidateBookingsCache(payload.mobile);
    return booking;
  }

  if (isSheetsApi()) return sheetsCreateBooking(payload);
  throw new ApiError("API not configured for REST mode", 500);
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
    booking.paymentStatus = "Submitted";
    if (payload.mobile) invalidateBookingsCache(payload.mobile);
    return;
  }

  if (isSheetsApi()) {
    return sheetsSubmitUtr(payload);
  }

  throw new ApiError("API not configured for REST mode", 500);
}

export { ApiError };
