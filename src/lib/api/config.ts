export const sheetsActions = {
  login: "login",
  /** Lookup user by mobile in Users sheet */
  getUser: "getUser",
  consoleTypes: "consoleTypes",
  availableSlots: "availableSlots",
  myBookings: "myBookings",
  /** Set in env when your script supports creating bookings via POST */
  createBooking: process.env.NEXT_PUBLIC_SHEETS_ACTION_CREATE_BOOKING ?? "createBooking",
  submitUTR: "submitUTR",
  /** Admin: list all bookings */
  getBookings:
    process.env.NEXT_PUBLIC_SHEETS_ACTION_GET_BOOKINGS ?? "getBookings",
  /** Admin: mark booking Confirmed + payment Paid */
  verifyPayment:
    process.env.NEXT_PUBLIC_SHEETS_ACTION_VERIFY_PAYMENT ?? "verifyPayment",
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

/** Dev-only hint when mock data is used because the API URL was never set. */
export function shouldShowDemoModeBanner(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return false;
  return !getApiBaseUrl();
}
