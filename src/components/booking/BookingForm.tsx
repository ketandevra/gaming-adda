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
  slotId: string;
  disabled?: boolean;
}

function BookingFormComponent({
  onSubmit,
  consoleId,
  slotId,
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

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!mobile) {
        setSubmitError("Mobile number missing. Please log in again.");
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
          slotId,
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
    [mobile, customerName, onSubmit, consoleId, slotId],
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
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="md"
        fullWidth
        disabled={disabled || submitting || !mobile}
      >
        {submitting ? "Confirming..." : "Confirm Booking"}
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
    prev.slotId === next.slotId &&
    prev.disabled === next.disabled
  );
}

export const BookingForm = memo(BookingFormComponent, bookingFormPropsAreEqual);
