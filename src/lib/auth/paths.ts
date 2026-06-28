/** Routes that require sign-in (book flow + my bookings + admin). */
export function isProtectedPath(pathname: string): boolean {
  if (pathname === "/bookings" || pathname.startsWith("/bookings/")) {
    return true;
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return true;
  }
  if (/^\/consoles\/[^/]+/.test(pathname)) {
    return true;
  }
  return false;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function loginPathWithRedirect(redirectTo: string): string {
  const safe =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";
  return `/login?redirect=${encodeURIComponent(safe)}`;
}

export function sanitizeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  if (value.startsWith("/login")) {
    return "/";
  }
  return value;
}
