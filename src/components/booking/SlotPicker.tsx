"use client";

import { memo, useCallback, useMemo } from "react";
import { formatCurrency, formatTime, cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

interface SlotButtonProps {
  slot: TimeSlot;
  selected: boolean;
  onSelect: (slotId: string) => void;
}

const SlotButton = memo(function SlotButton({
  slot,
  selected,
  onSelect,
}: SlotButtonProps) {
  const disabled = !slot.isAvailable;

  const handleClick = useCallback(() => {
    onSelect(slot.id);
  }, [onSelect, slot.id]);

  const timeLabel = useMemo(
    () => `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
    [slot.startTime, slot.endTime],
  );

  const statusLabel = useMemo(() => {
    if (disabled) return "Booked";
    if (slot.price) return formatCurrency(slot.price);
    return "Available";
  }, [disabled, slot.price]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
              "flex min-h-11 touch-manipulation flex-col items-start rounded-lg border px-2.5 py-2 text-left transition active:scale-[0.98]",
        disabled &&
          "cursor-not-allowed border-[var(--border)] bg-white/[0.02] opacity-40",
        !disabled &&
          !selected &&
          "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50",
        selected &&
          "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]",
      )}
    >
      <span className="text-xs font-medium text-[var(--foreground)]">
        {timeLabel}
      </span>
      <span className="mt-0.5 text-[10px] text-[var(--muted)]">{statusLabel}</span>
    </button>
  );
});

function SlotPickerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

function SlotPickerComponent({
  slots,
  selectedSlotId,
  onSelect,
  loading,
  emptyMessage,
}: SlotPickerProps) {
  if (loading) {
    return <SlotPickerSkeleton />;
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--muted)]">
        {emptyMessage ??
          "No upcoming slots for this date. Try another day."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot) => (
        <SlotButton
          key={slot.id}
          slot={slot}
          selected={selectedSlotId === slot.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function slotPickerPropsAreEqual(
  prev: SlotPickerProps,
  next: SlotPickerProps,
): boolean {
  return (
    prev.selectedSlotId === next.selectedSlotId &&
    prev.loading === next.loading &&
    prev.onSelect === next.onSelect &&
    prev.emptyMessage === next.emptyMessage &&
    prev.slots === next.slots
  );
}

export const SlotPicker = memo(SlotPickerComponent, slotPickerPropsAreEqual);
