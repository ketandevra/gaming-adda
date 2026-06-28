"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingUpiPrompt } from "@/components/booking/BookingUpiPrompt";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { ConsoleBookingSkeleton } from "@/components/consoles/ConsoleBookingSkeleton";
import { ConsoleImage } from "@/components/consoles/ConsoleImage";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  UsersIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/Badge";
import { createBookings, fetchConsole, fetchSlots } from "@/lib/api/client";
import { getCached } from "@/lib/api/cache";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  filterFutureSlots,
  isDateBeforeToday,
} from "@/lib/slots/filter";
import {
  formatSlotTimeRange,
  selectedSlotsFromIds,
  sumSlotPrices,
  toggleSlotSelection,
} from "@/lib/slots/selection";
import {
  formatCurrency,
  platformLabel,
  toDateInputValue,
} from "@/lib/utils";
import type { GameConsole, TimeSlot } from "@/types";

interface ConsoleBookingClientProps {
  consoleId: string;
}

function slotsCacheKey(consoleId: string, date: string) {
  return `slots:${consoleId}:${date}`;
}

export function ConsoleBookingClient({ consoleId }: ConsoleBookingClientProps) {
  const router = useRouter();
  const mounted = useHasMounted();
  const [gameConsole, setGameConsole] = useState<GameConsole | null>(null);
  const [consoleLoading, setConsoleLoading] = useState(true);
  const [consoleError, setConsoleError] = useState<string | null>(null);
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [slotsRefreshing, setSlotsRefreshing] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{
    bookingId: string;
    amount: number;
  } | null>(null);
  const loadedDates = useRef(new Set<string>());

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    setConsoleLoading(true);
    setConsoleError(null);

    fetchConsole(consoleId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setConsoleError("Console not found");
          setGameConsole(null);
        } else {
          setGameConsole(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setConsoleError(
            err instanceof Error ? err.message : "Could not load console",
          );
          setGameConsole(null);
        }
      })
      .finally(() => {
        if (!cancelled) setConsoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, consoleId]);

  useEffect(() => {
    if (!mounted || !gameConsole) return;

    if (isDateBeforeToday(date)) {
      setSlots([]);
      setSelectedSlotIds([]);
      setSlotsRefreshing(false);
      setSlotsError(null);
      return;
    }

    const key = slotsCacheKey(gameConsole.id, date);
    const cached = getCached<TimeSlot[]>(key);
    if (cached) {
      setSlots(filterFutureSlots(cached));
      setSelectedSlotIds([]);
      setSlotsRefreshing(false);
    }

    const showSkeleton = !cached && !loadedDates.current.has(date);
    if (showSkeleton) setSlotsRefreshing(true);
    else if (!cached) setSlotsRefreshing(true);

    let cancelled = false;

    fetchSlots(gameConsole.id, date, gameConsole.hourlyRate)
      .then((data) => {
        if (cancelled) return;
        setSlots(filterFutureSlots(data));
        setSelectedSlotIds([]);
        loadedDates.current.add(date);
      })
      .catch((err) => {
        if (cancelled) return;
        setSlotsError(
          err instanceof Error ? err.message : "Could not load slots",
        );
        if (!cached) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, gameConsole, date]);

  const futureSlots = useMemo(() => filterFutureSlots(slots), [slots]);

  useEffect(() => {
    setSelectedSlotIds((prev) =>
      prev.filter((id) => futureSlots.some((s) => s.id === id && s.isAvailable)),
    );
  }, [futureSlots]);

  const selectedSlots = useMemo(
    () => selectedSlotsFromIds(futureSlots, selectedSlotIds),
    [futureSlots, selectedSlotIds],
  );

  const showSlotSkeleton = useMemo(
    () => slotsRefreshing && slots.length === 0,
    [slotsRefreshing, slots.length],
  );

  const minDate = useMemo(() => toDateInputValue(new Date()), []);

  const handleToggleSlot = useCallback((slotId: string) => {
    setSelectedSlotIds((prev) => toggleSlotSelection(prev, slotId));
  }, []);

  const handleClearSlots = useCallback(() => {
    setSelectedSlotIds([]);
  }, []);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDate(e.target.value);
    },
    [],
  );

  const handleBooking = useCallback(
    async (payload: Parameters<typeof createBookings>[0]) => {
      const booking = await createBookings(payload);

      const amount =
        booking.totalAmount ??
        (gameConsole
          ? sumSlotPrices(selectedSlots, gameConsole.hourlyRate)
          : 0);

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("gaming-adda:booking-success", "1");
      }

      setPendingPayment({
        bookingId: booking.id,
        amount,
      });
    },
    [gameConsole, selectedSlots],
  );

  const handleViewBookings = useCallback(() => {
    router.push("/bookings");
  }, [router]);

  const totalLabel = useMemo(() => {
    if (selectedSlots.length === 0 || !gameConsole) return null;
    return formatCurrency(
      sumSlotPrices(selectedSlots, gameConsole.hourlyRate),
    );
  }, [selectedSlots, gameConsole]);

  if (pendingPayment) {
    return (
      <BookingUpiPrompt
        bookingId={pendingPayment.bookingId}
        amount={pendingPayment.amount}
        onViewBookings={handleViewBookings}
      />
    );
  }

  if (!mounted || (consoleLoading && !gameConsole)) {
    return <ConsoleBookingSkeleton />;
  }

  if (consoleError || !gameConsole) {
    return (
      <div className="page-shell py-10 text-center">
        <p className="text-sm text-[var(--muted)]">
          {consoleError ?? "Console not found"}
        </p>
        <Link
          href="/consoles"
          prefetch={false}
          className="mt-4 inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          <ChevronRightIcon size={16} className="rotate-180" />
          Back to consoles
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
        <div>
          <div className="card mb-5 overflow-hidden">
            <ConsoleImage
              console={gameConsole}
              className="aspect-[21/9] w-full sm:aspect-[2.5/1]"
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
            />
            <div className="p-5">
              <Badge variant="accent">{platformLabel(gameConsole.platform)}</Badge>
              <h1 className="page-title mt-2">{gameConsole.name}</h1>
              {gameConsole.description ? (
                <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                  {gameConsole.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div className="inline-flex items-center gap-1.5">
                  <ClockIcon size={14} className="text-[var(--muted)]" />
                  <span className="text-[var(--muted)]">Rate </span>
                  <span className="font-bold text-[var(--foreground)]">
                    {formatCurrency(gameConsole.hourlyRate)}/hr
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <UsersIcon size={14} className="text-[var(--muted)]" />
                  <span className="text-[var(--muted)]">Players </span>
                  <span className="font-semibold text-[var(--foreground)]">
                    Up to {gameConsole.maxPlayers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-label inline-flex items-center gap-1">
                  <CalendarIcon size={12} />
                  Step 1
                </p>
                <h2 className="mt-1 text-base font-bold">Select date & time</h2>
              </div>
              <label className="flex w-full flex-col gap-1.5 sm:w-auto">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--foreground-secondary)]">
                  <CalendarIcon size={14} />
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={handleDateChange}
                  className="date-input w-full min-h-11 sm:min-h-10"
                />
              </label>
            </div>

            {slotsRefreshing && futureSlots.length > 0 ? (
              <p className="mb-3 text-xs text-[var(--foreground-secondary)]">Updating slots…</p>
            ) : null}

            {isDateBeforeToday(date) ? (
              <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-5 text-center text-sm text-[var(--foreground-secondary)]">
                Past dates cannot be booked. Choose today or a future date.
              </p>
            ) : null}

            {slotsError ? (
              <p className="mb-4 alert-error rounded-[var(--radius-md)] px-3 py-2 text-sm">
                {slotsError}
              </p>
            ) : null}

            {!isDateBeforeToday(date) ? (
              <SlotPicker
                slots={futureSlots}
                selectedSlotIds={selectedSlotIds}
                onToggle={handleToggleSlot}
                loading={showSlotSkeleton}
                emptyMessage={
                  slots.length > 0 && futureSlots.length === 0
                    ? "No upcoming slots left for today. Try a later time or another date."
                    : undefined
                }
              />
            ) : null}
          </section>
        </div>

        <aside className="card h-fit p-4 sm:p-5 lg:sticky lg:top-20">
          <p className="text-label inline-flex items-center gap-1">
            <ClockIcon size={12} />
            Step 2
          </p>
          <h2 className="mt-1 text-base font-bold">Booking summary</h2>

          {selectedSlots.length > 0 && totalLabel ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[var(--foreground-secondary)]">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
                </p>
                <button
                  type="button"
                  onClick={handleClearSlots}
                  className="text-xs font-medium text-[var(--accent-muted)] hover:underline"
                >
                  Clear
                </button>
              </div>
              <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] px-3 py-2">
                {selectedSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex justify-between gap-2 text-[var(--foreground)]"
                  >
                    <span>{formatSlotTimeRange(slot)}</span>
                    <span className="shrink-0 font-medium text-[var(--foreground-secondary)]">
                      {formatCurrency(slot.price ?? gameConsole.hourlyRate)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between rounded-[var(--radius-sm)] border border-[var(--cyan)]/25 bg-[var(--accent-soft)] px-3 py-2.5">
                <span className="font-semibold text-[var(--foreground)]">Total</span>
                <span className="text-lg font-bold brand-gradient-text">
                  {totalLabel}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] px-3 py-4 text-center text-sm text-[var(--foreground-secondary)]">
              Select one or more available time slots to continue.
            </p>
          )}

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--foreground-secondary)]">
              Your details
            </h3>
            <BookingForm
              consoleId={gameConsole.id}
              slotIds={selectedSlotIds}
              onSubmit={handleBooking}
              disabled={selectedSlotIds.length === 0}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
