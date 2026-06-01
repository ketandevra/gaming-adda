import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto hidden border-t border-[var(--border)] bg-[var(--surface)]/50 md:block">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[var(--foreground)]">The Gaming Adda</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Premium console gaming lounge — book by the hour.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <Link href="/consoles" className="hover:text-[var(--accent)]">
            Consoles
          </Link>
          <Link href="/bookings" className="hover:text-[var(--accent)]">
            My Bookings
          </Link>
        </div>
      </div>
    </footer>
  );
}
