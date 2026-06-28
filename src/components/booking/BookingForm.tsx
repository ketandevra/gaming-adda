"use client";

import { memo, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeMobile } from "@/lib/auth/mobile";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CreateBookingPayload } from "@/types";

interface BookingFormProps {
  onSubmit: (data: CreateBookingPayload) => Promise<void>;
  consoleId: string;
  slotIds: string[];
  disabled?: boolean;
}

function BookingFormComponent({
  onSubmit,
  consoleId,
  slotIds,
  disabled,
}: BookingFormProps) {
  const { user, isReady } = useAuth();
  const mounted = useHasMounted();
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setCustomerName(user.name);
    }
  }, [user?.name]);

  const mobile = useMemo(() => {
    if (!mounted || !isReady) return "";
    return normalizeMobile(user?.mobile);
  }, [mounted, isReady, user?.mobile]);

  const confirmLabel = useMemo(() => {
    if (submitting) return "Confirming…";
    if (slotIds.length > 1) {
      return `Confirm ${slotIds.length} slots`;
    }
    return "Confirm Booking";
  }, [submitting, slotIds.length]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!mobile) {
        setSubmitError("Mobile number missing. Please log in again.");
        return;
      }

      if (slotIds.length === 0) {
        setSubmitError("Select at least one time slot.");
        return;
      }

      if (!customerName.trim()) {
        setNameError("Name is required");
        return;
      }
      setNameError(undefined);

      setSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmit({
          consoleId,
          slotIds,
          customerName: customerName.trim(),
          mobile,
          customerPhone: mobile,
          customerEmail: `${mobile}@gaming-adda.local`,
        });
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Booking failed. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [mobile, customerName, onSubmit, consoleId, slotIds],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomerName(e.target.value);
    },
    [],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mobile ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 px-4 py-3 text-sm">
          <span className="text-[var(--muted)]">Mobile </span>
          <span className="font-semibold text-[var(--foreground)]">{mobile}</span>
        </div>
      ) : null}

      <Input
        label="Full name"
        name="customerName"
        value={customerName}
        onChange={handleNameChange}
        error={nameError}
        placeholder="Your name"
        autoComplete="name"
      />

      {submitError ? (
        <p className="alert-error rounded-lg px-3 py-2 text-sm">
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="md"
        fullWidth
        disabled={disabled || submitting || !mobile || slotIds.length === 0}
      >
        {confirmLabel}
      </Button>
    </form>
  );
}

function bookingFormPropsAreEqual(
  prev: BookingFormProps,
  next: BookingFormProps,
): boolean {
  return (
    prev.onSubmit === next.onSubmit &&
    prev.consoleId === next.consoleId &&
    prev.slotIds === next.slotIds &&
    prev.disabled === next.disabled
  );
}

export const BookingForm = memo(BookingFormComponent, bookingFormPropsAreEqual);
