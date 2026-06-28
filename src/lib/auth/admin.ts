import { normalizeMobile } from "@/lib/auth/mobile";

const DEFAULT_ADMIN_MOBILE = "9636933097";
const DEFAULT_ADMIN_PASSWORD = "Gaming@1995";
export const ADMIN_DISPLAY_NAME = "Admin";

export function getAdminMobile(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_MOBILE?.trim();
  return normalizeMobile(fromEnv || DEFAULT_ADMIN_MOBILE);
}

export function getAdminPassword(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

export function isAdminMobile(mobile?: string | null): boolean {
  if (!mobile) return false;
  return normalizeMobile(mobile) === getAdminMobile();
}

export function verifyAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}
