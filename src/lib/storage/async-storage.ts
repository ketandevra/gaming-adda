/**
 * Browser async key-value storage (localStorage) with an AsyncStorage-like API.
 */

const memory = new Map<string, string>();

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const asyncStorage = {
  async getItem(key: string): Promise<string | null> {
    if (canUseLocalStorage()) {
      return window.localStorage.getItem(key);
    }
    return memory.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (canUseLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }
    memory.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (canUseLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }
    memory.delete(key);
  },
};
