import { getApiBaseUrl, shouldUseMockData } from "@/lib/api/config";
import { getMockConsoles } from "@/lib/api/mock-data";
import { sheetsFetchConsoles } from "@/lib/api/sheets-client";

/** Pre-render dynamic `[id]` routes for static export (GitHub Pages). */
export async function getConsoleStaticParams(): Promise<{ id: string }[]> {
  if (shouldUseMockData()) {
    return getMockConsoles().map((c) => ({ id: c.id }));
  }

  if (!getApiBaseUrl()) {
    return [{ id: "1" }];
  }

  try {
    const consoles = await sheetsFetchConsoles();
    if (consoles.length === 0) return [{ id: "1" }];
    return consoles.map((c) => ({ id: c.id }));
  } catch {
    return [{ id: "1" }];
  }
}

/** Booking detail pages are client-driven; one shell page is enough for export. */
export function getBookingStaticParams(): { id: string }[] {
  return [{ id: "_" }];
}
