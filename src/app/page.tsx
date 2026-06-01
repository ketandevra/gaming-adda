import Link from "next/link";

const linkBtn =
  "inline-flex min-h-9 items-center rounded-lg px-4 py-2 text-sm font-semibold transition";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="glow-orb -left-32 top-16 h-48 w-48 bg-[var(--accent)]" />
      <div className="glow-orb right-0 top-32 h-56 w-56 bg-[var(--accent-secondary)]" />

      <section className="bg-grid relative border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-3.5 py-8 sm:px-5 sm:py-12">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            The Gaming Adda
          </p>
          <h1 className="font-display mt-2 max-w-2xl text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-3xl">
            Book your console.
            <span className="block text-[var(--accent)]">Play without the wait.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
            Reserve PS5, Xbox, Switch, elite PC rigs, and VR stations by the hour.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/consoles"
              prefetch={false}
              className={`${linkBtn} bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]`}
            >
              Browse Consoles
            </Link>
            <Link
              href="/bookings"
              className={`${linkBtn} border border-[var(--border)] font-medium text-[var(--foreground)] hover:border-[var(--accent)]`}
            >
              My Bookings
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-5 sm:max-w-md">
            <div>
              <dt className="text-lg font-bold text-[var(--accent)]">5+</dt>
              <dd className="text-xs text-[var(--muted)]">Stations</dd>
            </div>
            <div>
              <dt className="text-lg font-bold text-[var(--accent)]">10–22</dt>
              <dd className="text-xs text-[var(--muted)]">Open hours</dd>
            </div>
            <div>
              <dt className="text-lg font-bold text-[var(--accent)]">1hr</dt>
              <dd className="text-xs text-[var(--muted)]">Slot length</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3.5 py-8 sm:px-5">
        <div className="section-card p-5 text-center sm:p-6">
          <h2 className="font-display text-lg font-bold">Ready to play?</h2>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Pick a console, choose your slot, and confirm in seconds.
          </p>
          <Link
            href="/consoles"
            prefetch={false}
            className={`${linkBtn} mt-4 bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]`}
          >
            View all consoles
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)]/40">
        <div className="mx-auto max-w-6xl px-3.5 py-8 sm:px-5">
          <h2 className="font-display text-center text-lg font-bold">How it works</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a console",
                desc: "Browse stations by platform and price.",
              },
              {
                step: "02",
                title: "Choose a slot",
                desc: "Select date and available hour.",
              },
              {
                step: "03",
                title: "Confirm & play",
                desc: "Book with your mobile — show up and game.",
              },
            ].map((item) => (
              <li key={item.step} className="text-center sm:text-left">
                <span className="font-display text-2xl font-bold text-[var(--accent)]/40">
                  {item.step}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
