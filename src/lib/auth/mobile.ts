/** API may return mobile as number or string — always normalize for display and requests. */
export function normalizeMobile(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}
