export const mainNav = [
  { href: "/", label: "Home", shortLabel: "Home" },
  { href: "/consoles", label: "Consoles", shortLabel: "Consoles" },
  { href: "/bookings", label: "My Bookings", shortLabel: "My Bookings" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
