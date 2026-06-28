import { normalizeMobile } from "@/lib/auth/mobile";
import type { User } from "@/types/auth";

export const AUTH_STORAGE_KEY = "gaming-adda:user";
export const AUTH_COOKIE_KEY = "gaming-adda-user";

let memoryUser: User | null = null;

function parseUser(raw: string): User | null {
  try {
    const user = JSON.parse(raw) as User;
    const mobile = normalizeMobile(user.mobile);
    const name = String(user.name ?? "").trim();
    if (!name || mobile.length !== 10) return null;
    return { ...user, mobile, name };
  } catch {
    return null;
  }
}

function setAuthCookie(user: User): void {
  const payload = encodeURIComponent(
    JSON.stringify({
      name: user.name,
      mobile: user.mobile,
      id: user.id,
      isAdmin: user.isAdmin,
    }),
  );
  document.cookie = `${AUTH_COOKIE_KEY}=${payload}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function getAuthCookie(): User | null {
  const prefix = `${AUTH_COOKIE_KEY}=`;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  if (!match) return null;
  try {
    return parseUser(decodeURIComponent(match.slice(prefix.length)));
  } catch {
    return null;
  }
}

function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function readFromWebStorage(
  get: (key: string) => string | null,
): User | null {
  try {
    const raw = get(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return parseUser(raw);
  } catch {
    return null;
  }
}

/** Read session from memory, localStorage, sessionStorage, or cookie. */
export function readStoredUser(): User | null {
  if (memoryUser) return memoryUser;
  if (typeof window === "undefined") return null;

  return (
    readFromWebStorage((key) => window.localStorage.getItem(key)) ??
    readFromWebStorage((key) => window.sessionStorage.getItem(key)) ??
    getAuthCookie()
  );
}

/** @deprecated Use readStoredUser */
export function getStoredUserSync(): User | null {
  return readStoredUser();
}

/** Persist session across localStorage, sessionStorage, cookie, and memory. */
export function persistUser(user: User): void {
  const normalized: User = {
    ...user,
    mobile: normalizeMobile(user.mobile),
    name: String(user.name ?? "").trim(),
  };

  if (!normalized.name || normalized.mobile.length !== 10) {
    throw new Error("Enter a valid name and 10-digit mobile number.");
  }

  const json = JSON.stringify(normalized);
  memoryUser = normalized;

  let saved = false;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, json);
      saved = true;
    } catch {
      // Private browsing or storage blocked
    }

    try {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, json);
      saved = true;
    } catch {
      // sessionStorage blocked
    }

    try {
      setAuthCookie(normalized);
      saved = true;
    } catch {
      // cookie blocked
    }
  }

  if (!saved && typeof window !== "undefined") {
    throw new Error(
      "Could not save your session. Turn off private browsing or allow site storage, then try again.",
    );
  }
}

export async function getStoredUser(): Promise<User | null> {
  return readStoredUser();
}

export async function setStoredUser(user: User): Promise<void> {
  persistUser(user);
}

export async function clearStoredUser(): Promise<void> {
  memoryUser = null;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }

  clearAuthCookie();
}
