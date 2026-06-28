"use client";

import { memo, useCallback, useMemo } from "react";
import { CheckIcon, ClockIcon } from "@/components/icons";
import { formatCurrency, formatTime, cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onToggle: (slotId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

interface SlotButtonProps {
  slot: TimeSlot;
  selected: boolean;
  onToggle: (slotId: string) => void;
}

const SlotButton = memo(function SlotButton({
  slot,
  selected,
  onToggle,
}: SlotButtonProps) {
  const disabled = !slot.isAvailable;

  const handleClick = useCallback(() => {
    onToggle(slot.id);
  }, [onToggle, slot.id]);

  const timeLabel = useMemo(
    () => `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
    [slot.startTime, slot.endTime],
  );

  const statusLabel = useMemo(() => {
    if (disabled) return "Booked";
    if (selected) return "Selected";
    if (slot.price) return formatCurrency(slot.price);
    return "Available";
  }, [disabled, selected, slot.price]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={selected}
      className={cn(
        "relative flex min-h-12 touch-manipulation flex-col items-start rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition active:scale-[0.98]",
        disabled &&
          "cursor-not-allowed border-[var(--border)] bg-[var(--surface)] opacity-45",
        !disabled &&
          !selected &&
          "border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--accent)]",
        selected &&
          "border-[var(--cyan)] bg-[var(--accent-soft)] ring-2 ring-[var(--accent-soft)]",
      )}
    >
      {selected ? (
        <span
          className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white"
          aria-hidden
        >
          <CheckIcon size={10} strokeWidth={3} />
        </span>
      ) : null}
      <span
        className={cn(
          "text-sm font-semibold",
          selected ? "text-[var(--accent-muted)]" : "text-[var(--foreground)]",
        )}
      >
        {timeLabel}
      </span>
      <span
        className={cn(
          "mt-0.5 text-xs",
          disabled
            ? "text-[var(--muted)]"
            : selected
              ? "text-[var(--accent-muted)]"
              : "text-[var(--foreground-secondary)]",
        )}
      >
        {statusLabel}
      </span>
    </button>
  );
});

function SlotPickerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-elevated)]"
        />
      ))}
    </div>
  );
}

function SlotPickerComponent({
  slots,
  selectedSlotIds,
  onToggle,
  loading,
  emptyMessage,
}: SlotPickerProps) {
  if (loading) {
    return <SlotPickerSkeleton />;
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
        <ClockIcon size={24} className="mx-auto text-[var(--muted)]" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-[var(--foreground-secondary)]">
          {emptyMessage ??
            "No upcoming slots for this date. Try another day."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--foreground-secondary)]">
        Tap one or more available slots to book them together.
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot) => (
          <SlotButton
            key={slot.id}
            slot={slot}
            selected={selectedSlotIds.includes(slot.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function slotPickerPropsAreEqual(
  prev: SlotPickerProps,
  next: SlotPickerProps,
): boolean {
  return (
    prev.selectedSlotIds === next.selectedSlotIds &&
    prev.loading === next.loading &&
    prev.onToggle === next.onToggle &&
    prev.emptyMessage === next.emptyMessage &&
    prev.slots === next.slots
  );
}

export const SlotPicker = memo(SlotPickerComponent, slotPickerPropsAreEqual);
