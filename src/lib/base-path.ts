/** Prefix a root-relative path with `NEXT_PUBLIC_BASE_PATH` (GitHub Pages project site). */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
  if (!base) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
