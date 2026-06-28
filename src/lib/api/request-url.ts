import { withBasePath } from "@/lib/base-path";
import { getApiBaseUrl } from "./config";

type QueryParams = Record<string, string | number | boolean | undefined>;

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    hostname.endsWith(".local")
  );
}

/** True when the Next.js `/api/sheets` proxy should handle API traffic. */
export function shouldUseApiProxy(): boolean {
  const envProxy = process.env.NEXT_PUBLIC_USE_API_PROXY;
  if (envProxy === "true") return true;
  if (envProxy === "false") return false;

  if (typeof window !== "undefined") {
    return isLocalDevHost(window.location.hostname);
  }

  return process.env.NODE_ENV === "development";
}

function resolveClientPath(path: string): string {
  if (typeof window === "undefined") return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${withBasePath(normalized)}`;
}

function getDirectUrl(params: QueryParams): string {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

function getProxyUrl(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  const path = query ? `/api/sheets?${query}` : "/api/sheets";
  return resolveClientPath(path);
}

export function getSheetsGetUrl(params: QueryParams): string {
  if (shouldUseApiProxy()) return getProxyUrl(params);
  return getDirectUrl(params);
}

export function getSheetsPostUrl(): string {
  if (shouldUseApiProxy()) return resolveClientPath("/api/sheets");
  return getApiBaseUrl();
}

/** Avoid CORS preflight on direct Google Script GET (mobile Safari is strict). */
export function getSheetsFetchHeaders(
  init?: RequestInit,
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (shouldUseApiProxy()) {
    headers.Accept = "application/json";
    if (init?.body) headers["Content-Type"] = "application/json";
    return headers;
  }

  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}
