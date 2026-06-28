export const mainNav = [
  { href: "/", label: "Home", shortLabel: "Home" },
  { href: "/consoles", label: "Consoles", shortLabel: "Consoles" },
  { href: "/bookings", label: "My Bookings", shortLabel: "My Bookings" },
] as const;

export type NavItem = (typeof mainNav)[number] | {
  readonly href: "/admin";
  readonly label: "View Bookings";
  readonly shortLabel: "View Bookings";
};

const adminOnlyNav = [
  { href: "/", label: "Home", shortLabel: "Home" },
  { href: "/admin", label: "View Bookings", shortLabel: "View Bookings" },
] as const satisfies readonly NavItem[];

export function getNavItems(isAdmin: boolean): readonly NavItem[] {
  return isAdmin ? adminOnlyNav : mainNav;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
