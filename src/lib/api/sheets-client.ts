import { normalizeMobile } from "@/lib/auth/mobile";
import { combineDateAndTime } from "@/lib/utils";
import { CACHE_TTL, cachedFetch, invalidateCache } from "./cache";
import { getApiBaseUrl, sheetsActions } from "./config";
import {
  mapAvailableSlot,
  mapConsoleType,
  mapSheetsBooking,
  parseSlotId,
} from "./sheets-mappers";
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
} from "@/types";
import { ApiError } from "./client";

type SheetsParams = Record<string, string | number | boolean | undefined>;

const CACHE_KEYS = {
  consoles: "consoles:all",
  slots: (consoleId: string, date: string) => `slots:${consoleId}:${date}`,
  bookings: (mobile: string) => `bookings:${mobile}`,
};

function getProxyUrl(params: SheetsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  return `/api/sheets?${search.toString()}`;
}

function getDirectUrl(params: SheetsParams): string {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  return `${base}?${search.toString()}`;
}

async function sheetsFetch<T>(params: SheetsParams, init?: RequestInit): Promise<T> {
  const url =
    typeof window === "undefined" ? getDirectUrl(params) : getProxyUrl(params);

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
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
  const url =
    typeof window === "undefined" ? getApiBaseUrl() : "/api/sheets";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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
  return rows.map(mapConsoleType);
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

export function invalidateSlotsCache(consoleId: string, date: string) {
  invalidateCache(CACHE_KEYS.slots(consoleId, date));
}

export async function sheetsFetchBooking(_id: string): Promise<Booking | null> {
  return null;
}

export async function sheetsCreateBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const slot = parseSlotId(payload.slotId);
  if (!slot) {
    throw new ApiError("Invalid slot selection", 400);
  }

  const mobile = normalizeMobile(payload.mobile);

  const data = await sheetsPost<SheetsBooking | unknown>({
    action: sheetsActions.createBooking,
    consoleTypeId: Number(payload.consoleId),
    bookingDate: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    name: payload.customerName,
    mobile,
    customerName: payload.customerName,
    customerPhone: mobile,
    phone: mobile,
  });

  invalidateBookingsCache(mobile);
  invalidateSlotsCache(payload.consoleId, slot.date);

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return mapSheetsBooking(data as SheetsBooking);
  }

  const consoles = await sheetsFetchConsoles();
  const console_ = consoles.find((c) => c.id === payload.consoleId);

  return {
    id: `bk-${Date.now()}`,
    consoleId: payload.consoleId,
    consoleName: console_?.name,
    slotId: payload.slotId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail ?? `${mobile}@gaming-adda.local`,
    customerPhone: mobile,
    bookingDate: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    totalAmount: console_?.hourlyRate,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    notes: payload.notes,
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
}
