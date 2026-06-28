import { isSheetsApi, shouldUseMockData } from "@/lib/api/config";
import { sheetsLogin } from "@/lib/api/sheets-auth";
import { ApiError } from "@/lib/api/client";
import {
  ADMIN_DISPLAY_NAME,
  isAdminMobile,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { createLocalUser } from "@/lib/auth/login";
import { normalizeMobile } from "@/lib/auth/mobile";
import type { LoginPayload, User } from "@/types/auth";

async function registerUserInSheet(payload: LoginPayload): Promise<User> {
  const local = createLocalUser(payload);
  if (shouldUseMockData() || !isSheetsApi()) {
    return local;
  }

  try {
    return await sheetsLogin(payload);
  } catch (err) {
    if (err instanceof ApiError && /invalid action/i.test(err.message)) {
      return local;
    }
    throw err;
  }
}

/** Validate locally, register in Users sheet when API is configured, then return user. */
export async function authenticateUser(payload: LoginPayload): Promise<User> {
  const mobile = normalizeMobile(payload.mobile);

  if (isAdminMobile(mobile)) {
    if (!verifyAdminPassword(payload.adminPassword ?? "")) {
      throw new Error("Incorrect admin password");
    }

    const adminPayload: LoginPayload = {
      name: payload.name.trim() || ADMIN_DISPLAY_NAME,
      mobile,
    };
    const user = await registerUserInSheet(adminPayload);
    return { ...user, isAdmin: true };
  }

  createLocalUser(payload);
  return registerUserInSheet(payload);
}
