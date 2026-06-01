export const sheetsActions = {
  login: "login",
  consoleTypes: "consoleTypes",
  availableSlots: "availableSlots",
  myBookings: "myBookings",
  /** Set in env when your script supports creating bookings via POST */
  createBooking: process.env.NEXT_PUBLIC_SHEETS_ACTION_CREATE_BOOKING ?? "createBooking",
  submitUTR: "submitUTR",
} as const;

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  return url ?? "";
}

export function isSheetsApi(): boolean {
  return getApiBaseUrl().includes("script.google.com");
}

export function shouldUseMockData(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return true;
  return !getApiBaseUrl();
}
