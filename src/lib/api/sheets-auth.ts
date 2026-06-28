import { normalizeMobile } from "@/lib/auth/mobile";
import { sheetsActions } from "./config";
import { getSheetsGetUrl, getSheetsPostUrl, getSheetsFetchHeaders } from "./request-url";
import type { SheetsErrorResponse } from "./sheets-types";
import type { LoginPayload, User } from "@/types/auth";
import { ApiError } from "./client";

interface SheetsLoginResponse {
  success?: boolean;
  message?: string;
  id?: number | string;
  userId?: number | string;
  name?: string;
  mobile?: string | number;
  email?: string;
  user?: {
    id?: number | string;
    name?: string;
    mobile?: string | number;
    email?: string;
  };
}

function mapLoginResponse(
  data: SheetsLoginResponse,
  payload: LoginPayload,
): User {
  const nested = data.user;

  return {
    id: String(nested?.id ?? data.userId ?? data.id ?? ""),
    name: nested?.name ?? data.name ?? payload.name,
    mobile: normalizeMobile(
      nested?.mobile ?? data.mobile ?? payload.mobile,
    ),
    email: nested?.email ?? data.email,
  };
}

export async function sheetsLogin(payload: LoginPayload): Promise<User> {
  const name = payload.name.trim();
  const mobile = normalizeMobile(payload.mobile);

  const body = {
    action: sheetsActions.login,
    name,
    mobile,
    customerName: name,
    phone: mobile,
    customerPhone: mobile,
  };

  const url = getSheetsPostUrl();

  const response = await fetch(url, {
    method: "POST",
    redirect: "follow",
    headers: getSheetsFetchHeaders({
      body: JSON.stringify(body),
    }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      "Login failed — invalid response from server. Check that your Google Script accepts POST with JSON.",
      response.status,
    );
  }

  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as SheetsErrorResponse).success === false
  ) {
    throw new ApiError(
      (data as SheetsErrorResponse).message || "Login failed",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError("Login failed", response.status);
  }

  if (data && typeof data === "object") {
    const mapped = mapLoginResponse(data as SheetsLoginResponse, payload);
    return mapped;
  }

  return {
    name: payload.name.trim(),
    mobile: normalizeMobile(payload.mobile),
  };
}

interface SheetsUserResponse {
  success?: boolean;
  message?: string;
  name?: string;
  customerName?: string;
  mobile?: string | number;
  phone?: string | number;
  user?: {
    name?: string;
    customerName?: string;
    mobile?: string | number;
  };
}

/** Resolve display name from Users sheet (GET getUser). */
export async function sheetsLookupUserName(mobile: string): Promise<string | null> {
  const normalized = normalizeMobile(mobile);
  if (normalized.length !== 10) return null;

  const url = getSheetsGetUrl({
    action: sheetsActions.getUser,
    mobile: normalized,
  });

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: getSheetsFetchHeaders(),
      cache: "no-store",
    });

    const text = await response.text();
    if (!text) return null;

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return null;
    }

    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      (data as SheetsErrorResponse).success === false
    ) {
      return null;
    }

    if (!response.ok) return null;

    const row = data as SheetsUserResponse;
    const nested = row.user;
    const name =
      nested?.name?.trim() ||
      nested?.customerName?.trim() ||
      row.name?.trim() ||
      row.customerName?.trim();

    return name || null;
  } catch {
    return null;
  }
}
