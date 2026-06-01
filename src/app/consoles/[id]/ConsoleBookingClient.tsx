"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { ConsoleBookingSkeleton } from "@/components/consoles/ConsoleBookingSkeleton";
import { Badge } from "@/components/ui/Badge";
import { createBooking, fetchConsole, fetchSlots } from "@/lib/api/client";
import { getCached } from "@/lib/api/cache";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  filterFutureSlots,
  isDateBeforeToday,
} from "@/lib/slots/filter";
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
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slotsRefreshing, setSlotsRefreshing] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
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
      setSelectedSlotId(null);
      setSlotsRefreshing(false);
      setSlotsError(null);
      return;
    }

    const key = slotsCacheKey(gameConsole.id, date);
    const cached = getCached<TimeSlot[]>(key);
    if (cached) {
      setSlots(filterFutureSlots(cached));
      setSelectedSlotId(null);
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
        setSelectedSlotId(null);
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
    if (
      selectedSlotId &&
      !futureSlots.some((s) => s.id === selectedSlotId)
    ) {
      setSelectedSlotId(null);
    }
  }, [futureSlots, selectedSlotId]);

  const selectedSlot = useMemo(
    () => futureSlots.find((s) => s.id === selectedSlotId),
    [futureSlots, selectedSlotId],
  );

  const showSlotSkeleton = useMemo(
    () => slotsRefreshing && slots.length === 0,
    [slotsRefreshing, slots.length],
  );

  const minDate = useMemo(() => toDateInputValue(new Date()), []);

  const handleSelectSlot = useCallback((slotId: string) => {
    setSelectedSlotId(slotId);
  }, []);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDate(e.target.value);
    },
    [],
  );

  const handleBooking = useCallback(
    async (payload: Parameters<typeof createBooking>[0]) => {
      await createBooking(payload);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("gaming-adda:booking-success", "1");
      }
      router.push("/bookings");
    },
    [router],
  );

  const slotTimeLabel = useMemo(() => {
    if (!selectedSlot) return null;
    const start = new Date(selectedSlot.startTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
    const end = new Date(selectedSlot.endTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${start} – ${end}`;
  }, [selectedSlot]);

  const totalLabel = useMemo(() => {
    if (!selectedSlot || !gameConsole) return null;
    return formatCurrency(selectedSlot.price ?? gameConsole.hourlyRate);
  }, [selectedSlot, gameConsole]);

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
          className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Back to consoles
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:gap-5">
        <div>
          <Badge variant="accent">{platformLabel(gameConsole.platform)}</Badge>
          <h1 className="page-title mt-2">{gameConsole.name}</h1>

          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-[var(--muted)]">Rate </span>
              <span className="font-semibold text-[var(--accent)]">
                {formatCurrency(gameConsole.hourlyRate)}/hr
              </span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Players </span>
              <span className="font-semibold">Up to {gameConsole.maxPlayers}</span>
            </div>
          </div>

          <section className="mt-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-sm font-semibold">Select date & time</h2>
              <label className="flex flex-col gap-0.5 text-xs">
                <span className="text-[var(--muted)]">Date</span>
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={handleDateChange}
                  className="min-h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </label>
            </div>

            {slotsRefreshing && futureSlots.length > 0 ? (
              <p className="mb-2 text-xs text-[var(--muted)]">Updating slots…</p>
            ) : null}

            {isDateBeforeToday(date) ? (
              <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--muted)]">
                Past dates cannot be booked. Choose today or a future date.
              </p>
            ) : null}

            {slotsError ? (
              <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {slotsError}
              </p>
            ) : null}

            {!isDateBeforeToday(date) ? (
              <SlotPicker
                slots={futureSlots}
                selectedSlotId={selectedSlotId}
                onSelect={handleSelectSlot}
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

        <aside className="section-card h-fit p-3.5 lg:sticky lg:top-20">
          <h2 className="text-sm font-semibold">Booking summary</h2>

          {selectedSlot && slotTimeLabel && totalLabel ? (
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Slot</dt>
                <dd>{slotTimeLabel}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <dt className="font-medium">Total</dt>
                <dd className="text-base font-bold text-[var(--accent)]">
                  {totalLabel}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Select an available time slot to continue.
            </p>
          )}

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <h3 className="mb-3 text-xs font-medium text-[var(--muted)]">Your details</h3>
            <BookingForm
              consoleId={gameConsole.id}
              slotId={selectedSlotId ?? ""}
              onSubmit={handleBooking}
              disabled={!selectedSlotId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
