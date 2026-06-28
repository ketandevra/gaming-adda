"use client";

import { useCallback, useMemo, useState } from "react";
import { BookingUtrForm } from "@/components/booking/BookingUtrForm";
import { CheckCircleIcon } from "@/components/icons";
import { UpiPayButtons } from "@/components/booking/UpiPayButtons";
import { UpiPaymentQr } from "@/components/booking/UpiPaymentQr";
import { Button } from "@/components/ui/Button";
import { useAuthMobile } from "@/hooks/useAuthMobile";
import { formatCurrency } from "@/lib/utils";

interface BookingUpiPromptProps {
  bookingId: string;
  amount: number;
  onViewBookings: () => void;
}

export function BookingUpiPrompt({
  bookingId,
  amount,
  onViewBookings,
}: BookingUpiPromptProps) {
  const mobile = useAuthMobile();
  const [showUtrForm, setShowUtrForm] = useState(false);
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  const bookingIds = useMemo(() => [bookingId], [bookingId]);

  const handlePaidClick = useCallback(() => {
    setShowUtrForm(true);
  }, []);

  const handleUtrSubmitted = useCallback(() => {
    setUtrSubmitted(true);
  }, []);

  return (
    <div className="page-shell py-8">
      <div className="card mx-auto max-w-md overflow-hidden">
        <div className="booking-card-accent" aria-hidden />
        <div className="space-y-5 p-6 text-center">
          <div>
            <p className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--status-success-text)]">
              <CheckCircleIcon size={18} />
              Booking confirmed
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
              Complete UPI payment
            </h2>
            <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
              Pay {formatCurrency(amount)} to confirm your slot.
            </p>
            <p className="mt-1 break-all text-xs text-[var(--muted)]">
              Booking ID: {bookingId}
            </p>
          </div>

          {!showUtrForm ? (
            <>
              <UpiPaymentQr amount={amount} />

              <div className="relative flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  or pay with app
                </span>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              </div>

              <UpiPayButtons amount={amount} bookingId={bookingId} size="lg" />

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handlePaidClick}
              >
                Paid?
              </Button>
            </>
          ) : (
            <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-left">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Submit payment UTR
                </p>
                <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                  Enter the UTR from your UPI app after paying {formatCurrency(amount)}.
                </p>
              </div>
              <BookingUtrForm
                bookingIds={bookingIds}
                mobile={mobile}
                onSubmitted={handleUtrSubmitted}
                successMessage="Verifying Payment"
              />
              {!utrSubmitted ? (
                <button
                  type="button"
                  onClick={() => setShowUtrForm(false)}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
                >
                  Back to payment options
                </button>
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={onViewBookings}
            className="text-sm font-medium text-[var(--accent-muted)] hover:underline"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
