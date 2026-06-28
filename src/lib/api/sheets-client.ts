import { normalizeMobile } from "@/lib/auth/mobile";
import { combineDateAndTime } from "@/lib/utils";
import { CACHE_TTL, cachedFetch, invalidateCache } from "./cache";
import { sheetsActions } from "./config";
import { getSheetsGetUrl, getSheetsPostUrl, getSheetsFetchHeaders } from "./request-url";
import {
  mapAvailableSlot,
  mapConsoleType,
  mapSheetsBooking,
  parseSlotId,
} from "./sheets-mappers";
import { enrichConsoleWithImage } from "@/lib/console-images";
import type {
  SheetsAvailableSlot,
  SheetsBooking,
  SheetsConsoleType,
  SheetsErrorResponse,
} from "./sheets-types";
import type {
  Booking,
  CreateBookingPayload,
  GameConsole,
  SubmitBookingUtrPayload,
  TimeSlot,
  VerifyBookingPaymentPayload,
} from "@/types";
import { ApiError } from "./client";
import {
  resolveSlotsForBooking,
  sumResolvedSlotPrices,
} from "@/lib/bookings/slots";

type SheetsParams = Record<string, string | number | boolean | undefined>;

const CACHE_KEYS = {
  consoles: "consoles:all",
  slots: (consoleId: string, date: string) => `slots:${consoleId}:${date}`,
  bookings: (mobile: string) => `bookings:${mobile}`,
  allBookings: "bookings:admin:all",
};

async function sheetsFetch<T>(params: SheetsParams, init?: RequestInit): Promise<T> {
  const url = getSheetsGetUrl(params);

  const response = await fetch(url, {
    ...init,
    redirect: "follow",
    headers: {
      ...getSheetsFetchHeaders(init),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError("Invalid response from booking API", response.status);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as SheetsErrorResponse).success === false
  ) {
    throw new ApiError(
      (payload as SheetsErrorResponse).message || "Request failed",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError("Request failed", response.status);
  }

  return payload as T;
}

async function sheetsPost<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const url = getSheetsPostUrl();

  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: getSheetsFetchHeaders({ body: JSON.stringify(body) }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      "Booking API returned an invalid response.",
      response.status,
    );
  }

  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as SheetsErrorResponse).success === false
  ) {
    throw new ApiError((data as SheetsErrorResponse).message, response.status);
  }

  if (!response.ok) {
    throw new ApiError("Request failed", response.status);
  }

  return data as T;
}

async function fetchConsolesFromApi(): Promise<GameConsole[]> {
  const rows = await sheetsFetch<SheetsConsoleType[]>({
    action: sheetsActions.consoleTypes,
  });
  if (!Array.isArray(rows)) return [];
  return rows.map(mapConsoleType).map(enrichConsoleWithImage);
}

export async function sheetsFetchConsoles(): Promise<GameConsole[]> {
  return cachedFetch(
    CACHE_KEYS.consoles,
    fetchConsolesFromApi,
    CACHE_TTL.consoles,
  );
}

export async function sheetsFetchConsole(id: string): Promise<GameConsole | null> {
  const consoles = await sheetsFetchConsoles();
  return consoles.find((c) => c.id === id) ?? null;
}

export async function sheetsFetchSlots(
  consoleId: string,
  date: string,
  hourlyRate?: number,
): Promise<TimeSlot[]> {
  const rate =
    hourlyRate ??
    (await sheetsFetchConsole(consoleId))?.hourlyRate ??
    0;

  return cachedFetch(
    CACHE_KEYS.slots(consoleId, date),
    async () => {
      const rows = await sheetsFetch<SheetsAvailableSlot[]>({
        action: sheetsActions.availableSlots,
        consoleTypeId: consoleId,
        bookingDate: date,
      });
      if (!Array.isArray(rows)) return [];
      return rows.map((row) => mapAvailableSlot(consoleId, date, row, rate));
    },
    CACHE_TTL.slots,
  );
}

export async function sheetsFetchBookings(params: {
  mobile?: string;
}): Promise<Booking[]> {
  const mobile = normalizeMobile(params.mobile);
  if (!mobile) return [];

  return cachedFetch(
    CACHE_KEYS.bookings(mobile),
    async () => {
      const rows = await sheetsFetch<SheetsBooking[]>({
        action: sheetsActions.myBookings,
        mobile,
      });
      if (!Array.isArray(rows)) return [];
      return rows.map(mapSheetsBooking);
    },
    CACHE_TTL.bookings,
  );
}

export function invalidateBookingsCache(mobile: string) {
  invalidateCache(CACHE_KEYS.bookings(normalizeMobile(mobile)));
}

export function invalidateAllBookingsCache() {
  invalidateCache(CACHE_KEYS.allBookings);
}

export function invalidateSlotsCache(consoleId: string, date: string) {
  invalidateCache(CACHE_KEYS.slots(consoleId, date));
}

export async function sheetsFetchBooking(_id: string): Promise<Booking | null> {
  return null;
}

export async function sheetsCreateBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  if (payload.slotIds.length === 0) {
    throw new ApiError("No slot selected", 400);
  }

  const console_ = await sheetsFetchConsole(payload.consoleId);
  const hourlyRate = console_?.hourlyRate ?? 0;
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
  const mobile = normalizeMobile(payload.mobile);

  const data = await sheetsPost<SheetsBooking | unknown>({
    action: sheetsActions.createBooking,
    consoleTypeId: Number(payload.consoleId),
    bookingDate: first.date,
    startTime: first.startTime,
    endTime: last.endTime,
    name: payload.customerName,
    mobile,
    customerName: payload.customerName,
    customerPhone: mobile,
    phone: mobile,
    totalAmount,
  });

  invalidateBookingsCache(mobile);
  invalidateSlotsCache(payload.consoleId, first.date);

  const slotId = payload.slotIds[0]!;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const booking = mapSheetsBooking(data as SheetsBooking);
    return {
      ...booking,
      slotId,
      slotIds: payload.slotIds,
      totalAmount: booking.totalAmount ?? totalAmount,
    };
  }

  return {
    id: `bk-${Date.now()}`,
    consoleId: payload.consoleId,
    consoleName: console_?.name,
    slotId,
    slotIds: payload.slotIds,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail ?? `${mobile}@gaming-adda.local`,
    customerPhone: mobile,
    bookingDate: first.date,
    startTime: first.startTime,
    endTime: last.endTime,
    totalAmount,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    notes:
      payload.notes ??
      (payload.slotIds.length > 1 ? `${payload.slotIds.length} slots` : undefined),
  };
}

export async function sheetsSubmitUtr(
  payload: SubmitBookingUtrPayload,
): Promise<void> {
  await sheetsPost({
    action: sheetsActions.submitUTR,
    bookingId: payload.bookingId,
    utrNumber: payload.utrNumber,
  });

  if (payload.mobile) {
    invalidateBookingsCache(payload.mobile);
  }
  invalidateAllBookingsCache();
}

export async function sheetsFetchAllBookings(): Promise<Booking[]> {
  return cachedFetch(
    CACHE_KEYS.allBookings,
    async () => {
      const rows = await sheetsFetch<SheetsBooking[]>({
        action: sheetsActions.getBookings,
      });
      if (!Array.isArray(rows)) return [];
      return rows.map(mapSheetsBooking);
    },
    CACHE_TTL.bookings,
  );
}

export async function sheetsVerifyBookingPayment(
  payload: VerifyBookingPaymentPayload,
): Promise<void> {
  await sheetsPost({
    action: sheetsActions.verifyPayment,
    bookingId: payload.bookingId,
    fields: {
      bookingStatus: "Confirmed",
      paymentStatus: "Paid",
    },
  });
  invalidateAllBookingsCache();
}
