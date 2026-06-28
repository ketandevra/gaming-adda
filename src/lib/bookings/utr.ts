export function normalizeUtrForCompare(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function utrNumbersMatch(entered: string, expected: string): boolean {
  const a = normalizeUtrForCompare(entered);
  const b = normalizeUtrForCompare(expected);
  if (!a || !b) return false;
  return a === b;
}
