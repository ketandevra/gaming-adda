"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReceiptIcon } from "@/components/icons";
import { submitBookingUtr } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface BookingUtrFormProps {
  bookingIds: string[];
  mobile?: string;
  onSubmitted?: () => void;
  disabled?: boolean;
  successMessage?: string;
  className?: string;
}

export function BookingUtrForm({
  bookingIds,
  mobile,
  onSubmitted,
  disabled = false,
  successMessage = "UTR submitted. We will verify your payment shortly.",
  className,
}: BookingUtrFormProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = utrNumber.trim();

      if (disabled) {
        setSubmitError("Payment window has expired. This booking was cancelled.");
        return;
      }

      if (!trimmed) {
        setUtrError("UTR number is required");
        return;
      }
      if (!/^\d{6,22}$/.test(trimmed)) {
        setUtrError("Enter a valid UTR (6–22 digits)");
        return;
      }

      setUtrError(undefined);
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        await Promise.all(
          bookingIds.map((bookingId) =>
            submitBookingUtr({
              bookingId,
              utrNumber: trimmed,
              mobile,
            }),
          ),
        );
        setSubmitSuccess(successMessage);
        setUtrNumber("");
        onSubmitted?.();
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Could not submit UTR",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [bookingIds, disabled, mobile, onSubmitted, successMessage, utrNumber],
  );

  return (
    <div className={cn("space-y-3 text-left", className)}>
      {submitSuccess ? (
        <p className="alert-success rounded-lg px-3 py-2.5 text-xs leading-relaxed" role="status">
          {submitSuccess}
        </p>
      ) : null}

      {submitError ? (
        <p className="alert-error rounded-lg px-3 py-2.5 text-xs">{submitError}</p>
      ) : null}

      {!submitSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label={
              <span className="inline-flex items-center gap-1.5">
                <ReceiptIcon size={14} className="text-[var(--muted)]" />
                UTR / transaction reference
              </span>
            }
            name="utrNumber"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 123456789012"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            error={utrError}
            disabled={submitting || disabled}
          />
          <Button type="submit" fullWidth disabled={submitting || disabled}>
            {submitting ? "Submitting…" : "Submit UTR"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
