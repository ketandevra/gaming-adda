type CacheEntry<T> = { data: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export const CACHE_TTL = {
  consoles: 5 * 60 * 1000,
  slots: 2 * 60 * 1000,
  bookings: 60 * 1000,
} as const;

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const now = Date.now();
  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: now + ttlMs });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise as Promise<T>;
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry.data as T;
}

export function invalidateCache(keyOrPrefix: string) {
  if (store.has(keyOrPrefix)) {
    store.delete(keyOrPrefix);
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyOrPrefix)) store.delete(key);
  }
}
