import { getApiBaseUrl } from "./config";

type QueryParams = Record<string, string | number | boolean | undefined>;

/** True when the Next.js `/api/sheets` proxy is available (local `next dev`). */
export function shouldUseApiProxy(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "false") return false;
  return process.env.NODE_ENV === "development";
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
  return `/api/sheets?${search.toString()}`;
}

export function getSheetsGetUrl(params: QueryParams): string {
  if (shouldUseApiProxy()) return getProxyUrl(params);
  return getDirectUrl(params);
}

export function getSheetsPostUrl(): string {
  if (shouldUseApiProxy()) return "/api/sheets";
  return getApiBaseUrl();
}
