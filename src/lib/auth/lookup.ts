import { fetchBookings } from "@/lib/api/client";
import { isSheetsApi, shouldUseMockData } from "@/lib/api/config";
import { sheetsLookupUserName } from "@/lib/api/sheets-auth";
import { normalizeMobile } from "@/lib/auth/mobile";
import { readStoredUser } from "@/lib/auth/storage";

/** Resolve display name for a mobile from local session, Users sheet, or past bookings. */
export async function lookupCustomerName(mobile: string): Promise<string | null> {
  const normalized = normalizeMobile(mobile);
  if (normalized.length !== 10) return null;

  const stored = readStoredUser();
  if (stored?.mobile === normalized && stored.name.trim()) {
    return stored.name.trim();
  }

  if (!shouldUseMockData() && isSheetsApi()) {
    try {
      const fromUsers = await sheetsLookupUserName(normalized);
      if (fromUsers) return fromUsers;
    } catch {
      // Fall through to bookings lookup.
    }
  }

  try {
    const bookings = await fetchBookings({ mobile: normalized });
    for (const booking of bookings) {
      const name = booking.customerName?.trim();
      if (name) return name;
    }
  } catch {
    // Treat as new user when lookup fails offline or API errors.
  }

  return null;
}
