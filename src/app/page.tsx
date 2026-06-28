import Link from "next/link";
import Image from "next/image";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  GamepadIcon,
  SparklesIcon,
} from "@/components/icons";
import { SetupIcon } from "@/components/consoles/SetupIcon";
import { availableSetups } from "@/lib/available-setups";
import { withBasePath } from "@/lib/base-path";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-section border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-label">The Gaming Adda</p>

            <h1 className="font-display mt-3 text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              Book your console.
              <span className="mt-1 block brand-gradient-text">
                Play without the wait.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base text-[var(--foreground-secondary)]">
              Reserve PS5 stations, 8 ball pool, air hockey, table tennis, foosball
              and more by the hour. Pick a slot and confirm in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/consoles" prefetch={false} className="link-btn-primary inline-flex items-center justify-center gap-2">
                Browse Consoles
                <ChevronRightIcon size={18} />
              </Link>
              <Link href="/bookings" className="link-btn-secondary inline-flex items-center justify-center gap-2">
                <CalendarIcon size={18} />
                My Bookings
              </Link>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3 sm:max-w-md">
              <div className="stat-block">
                <dt className="inline-flex items-center justify-center gap-1">
                  <GamepadIcon size={18} className="text-[var(--accent-muted)]" />
                  6
                </dt>
                <dd>Stations</dd>
              </div>
              <div className="stat-block">
                <dt className="inline-flex items-center justify-center gap-1">
                  <ClockIcon size={18} className="text-[var(--accent-muted)]" />
                  10AM–12AM
                </dt>
                <dd>Open hours</dd>
              </div>
              <div className="stat-block">
                <dt className="inline-flex items-center justify-center gap-1">
                  <CalendarIcon size={18} className="text-[var(--accent-muted)]" />
                  1hr
                </dt>
                <dd>Slot length</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Image
              src={withBasePath("/logo.png")}
              alt="The Gaming Adda — Book. Play. Enjoy."
              width={360}
              height={360}
              priority
              className="hero-logo-glow h-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]"
            />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Available platforms</h2>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          Choose from a range of gaming setups.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {availableSetups.map((setup) => (
            <span key={setup.id} className="platform-chip">
              <SetupIcon setupId={setup.id} color={setup.color} size={18} />
              <span style={{ color: setup.color }}>{setup.label}</span>
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-label">How it works</p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--foreground)]">Three simple steps</h2>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a console",
                desc: "Browse stations by platform and hourly rate.",
                Icon: GamepadIcon,
              },
              {
                step: "02",
                title: "Choose a slot",
                desc: "Select a date and grab an available hour.",
                Icon: CalendarIcon,
              },
              {
                step: "03",
                title: "Confirm & play",
                desc: "Book with your mobile — show up and game.",
                Icon: CheckCircleIcon,
              },
            ].map((item) => (
              <li key={item.step} className="step-card">
                <div className="flex items-center gap-3">
                  <span className="step-number">{item.step}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-muted)]">
                    <item.Icon size={18} />
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground-secondary)]">
                  {item.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <div className="card mx-auto max-w-lg p-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-muted)]">
              <SparklesIcon size={24} />
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">Ready to play?</h2>
            <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
              Pick a console, choose your slot, and confirm in seconds.
            </p>
            <Link
              href="/consoles"
              prefetch={false}
              className="link-btn-primary mt-6 inline-flex items-center gap-2"
            >
              View all consoles
              <ChevronRightIcon size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
