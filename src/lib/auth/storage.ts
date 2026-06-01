import { normalizeMobile } from "@/lib/auth/mobile";
import { asyncStorage } from "@/lib/storage/async-storage";
import type { User } from "@/types/auth";

export const AUTH_STORAGE_KEY = "gaming-adda:user";

function parseUser(raw: string): User | null {
  try {
    const user = JSON.parse(raw) as User;
    return {
      ...user,
      mobile: normalizeMobile(user.mobile),
      name: String(user.name ?? "").trim(),
    };
  } catch {
    return null;
  }
}

/** Synchronous read for instant client hydration (no auth loading flash). */
export function getStoredUserSync(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return parseUser(raw);
  } catch {
    return null;
  }
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await asyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  const user = parseUser(raw);
  if (!user) {
    await asyncStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
  return user;
}

export async function setStoredUser(user: User): Promise<void> {
  const normalized: User = {
    ...user,
    mobile: normalizeMobile(user.mobile),
    name: String(user.name ?? "").trim(),
  };
  await asyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
}

export async function clearStoredUser(): Promise<void> {
  await asyncStorage.removeItem(AUTH_STORAGE_KEY);
}
