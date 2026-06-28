import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="mt-auto hidden border-t border-[var(--border)] bg-[var(--surface)] md:block">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <p className="font-bold text-[var(--foreground)]">The Gaming Adda</p>
            <p className="mt-0.5 text-sm text-[var(--foreground-secondary)]">
              Book. Play. Enjoy.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground-secondary)]">
          <Link href="/consoles" className="hover:text-[var(--accent-muted)]">
            Consoles
          </Link>
          <Link href="/bookings" className="hover:text-[var(--accent-muted)]">
            My Bookings
          </Link>
        </div>
      </div>
    </footer>
  );
}
