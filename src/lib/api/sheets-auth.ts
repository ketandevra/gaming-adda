import { normalizeMobile } from "@/lib/auth/mobile";
import { getApiBaseUrl } from "./config";
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
  const body = {
    action: "login" as const,
    name: payload.name.trim(),
    mobile: payload.mobile.trim(),
  };

  const url =
    typeof window === "undefined" ? getApiBaseUrl() : "/api/sheets";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
