import { normalizeMobile } from "@/lib/auth/mobile";
import type { LoginPayload, User } from "@/types/auth";

export function isValidMobileInput(value: string): boolean {
  return normalizeMobile(value).length === 10;
}

/** Sign in locally — bookings are looked up by mobile number via the API. */
export function createLocalUser(payload: LoginPayload): User {
  const name = payload.name.trim();
  const mobile = normalizeMobile(payload.mobile);

  if (!name) {
    throw new Error("Name is required");
  }
  if (mobile.length !== 10) {
    throw new Error("Enter a valid 10-digit mobile number");
  }

  return { name, mobile };
}
