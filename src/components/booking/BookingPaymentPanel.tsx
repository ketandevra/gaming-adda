"use client";

import { memo, useCallback, useMemo, useState, type FormEvent } from "react";
import { PaymentExpiryCountdown } from "@/components/booking/PaymentExpiryCountdown";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitBookingUtr } from "@/lib/api/client";
import {
  getPaymentQrImageUrl,
  getPaymentUpiVpa,
  isPaymentConfigured,
} from "@/lib/payment/config";
import {
  buildPaymentQrImageUrl,
  buildUpiPaymentUrl,
} from "@/lib/payment/upi";
import { usePaymentExpiryCountdown } from "@/hooks/usePaymentExpiryCountdown";
import { shouldShowPaymentCountdown } from "@/lib/bookings/payment-expiry";
import { areBookingsEqual } from "@/lib/react/compare";
import { isPaymentPending } from "@/lib/utils";
import { cn, formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingPaymentPanelProps {
  booking: Booking;
  onSubmitted?: () => void;
}

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-200">
        {n}
      </span>
      <span className="text-xs font-medium text-[var(--foreground)]">{label}</span>
    </div>
  );
}

function BookingPaymentPanelComponent({
  booking,
  onSubmitted,
}: BookingPaymentPanelProps) {
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amount = booking.totalAmount ?? 0;
  const upiVpa = useMemo(() => getPaymentUpiVpa(), []);
  const paymentConfigured = useMemo(() => isPaymentConfigured(), []);
  const showCountdown = shouldShowPaymentCountdown(booking);
  const expiryState = usePaymentExpiryCountdown(
    booking.expiresAt,
    showCountdown,
  );
  const paymentExpired = expiryState?.isExpired ?? false;
  const pending = isPaymentPending(booking.paymentStatus);

  const qrImageUrl = useMemo(() => {
    const staticQrUrl = getPaymentQrImageUrl();
    if (staticQrUrl) return staticQrUrl;
    const upiUrl =
      amount > 0
        ? buildUpiPaymentUrl({ amount, bookingId: booking.id })
        : null;
    return upiUrl ? buildPaymentQrImageUrl(upiUrl) : null;
  }, [amount, booking.id]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = utrNumber.trim();

      if (paymentExpired) {
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
        await submitBookingUtr({
          bookingId: booking.id,
          utrNumber: trimmed,
          mobile: booking.customerPhone,
        });
        setSubmitSuccess("UTR submitted. We will verify your payment shortly.");
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
    [booking.id, booking.customerPhone, onSubmitted, paymentExpired, utrNumber],
  );

  const handleUtrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUtrNumber(e.target.value);
    },
    [],
  );

  return (
    <section className="border-t border-amber-500/20 bg-gradient-to-b from-amber-500/[0.07] to-transparent">
      <div className="space-y-4 px-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)]/80 pb-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-200">
              Payment required
            </h4>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Confirm your slot with UPI payment
            </p>
          </div>
          {amount > 0 ? (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Amount
              </p>
              <p className="text-base font-bold leading-tight text-[var(--accent)]">
                {formatCurrency(amount)}
              </p>
            </div>
          ) : null}
        </div>

        {/* Timer + auto-cancel notice */}
        {showCountdown ? <PaymentExpiryCountdown booking={booking} /> : null}

        {/* Pay + UTR — hidden when timer expired */}
        {!paymentExpired && pending ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
              {/* QR column */}
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <StepBadge n={1} label="Scan & pay via UPI" />
                {qrImageUrl ? (
                  <div className="mt-2 w-full max-w-[148px] rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl}
                      alt="UPI payment QR code"
                      width={132}
                      height={132}
                      className="mx-auto h-auto w-full"
                    />
                  </div>
                ) : !paymentConfigured ? (
                  <p className="mt-2 max-w-[148px] rounded-lg border border-dashed border-[var(--border)] bg-white/5 px-2.5 py-3 text-center text-[11px] leading-relaxed text-[var(--muted)]">
                    Ask staff for UPI details to complete payment.
                  </p>
                ) : null}
                {upiVpa && qrImageUrl ? (
                  <p className="w-full max-w-[148px] text-center text-[10px] text-[var(--muted)] sm:text-left">
                    <span className="text-[var(--foreground)]">UPI ID</span>
                    <br />
                    <span className="font-mono text-[11px] text-amber-100/90">
                      {upiVpa}
                    </span>
                  </p>
                ) : null}
              </div>

              {/* UTR column */}
              <div className="flex min-w-0 flex-col gap-3">
                <StepBadge n={2} label="Submit transaction UTR" />

                {submitSuccess ? (
                  <p
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-200"
                    role="status"
                  >
                    {submitSuccess}
                  </p>
                ) : null}

                {submitError ? (
                  <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                    {submitError}
                  </p>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-1 space-y-3">
                  <Input
                    label="UTR / transaction reference"
                    name="utrNumber"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="e.g. 123456789012"
                    value={utrNumber}
                    onChange={handleUtrChange}
                    error={utrError}
                    disabled={submitting}
                  />
                  <Button type="submit" fullWidth disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit UTR"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function paymentPanelPropsAreEqual(
  prev: BookingPaymentPanelProps,
  next: BookingPaymentPanelProps,
): boolean {
  if (prev === next) return true;
  if (!prev?.booking || !next?.booking) return false;

  return (
    prev.onSubmitted === next.onSubmitted &&
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const BookingPaymentPanel = memo(
  BookingPaymentPanelComponent,
  paymentPanelPropsAreEqual,
);
