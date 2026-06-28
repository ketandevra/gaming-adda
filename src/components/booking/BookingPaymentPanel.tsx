"use client";

import { memo, useMemo } from "react";
import { BookingUtrForm } from "@/components/booking/BookingUtrForm";
import { PaymentExpiryCountdown } from "@/components/booking/PaymentExpiryCountdown";
import { QrCodeIcon, ReceiptIcon } from "@/components/icons";
import { isPaymentConfigured } from "@/lib/payment/config";
import { UpiPayButtons } from "@/components/booking/UpiPayButtons";
import { UpiPaymentQr } from "@/components/booking/UpiPaymentQr";
import { bookingNeedsPayment } from "@/lib/bookings/payment";
import { usePaymentExpiryCountdown } from "@/hooks/usePaymentExpiryCountdown";
import { getRelatedBookingIds } from "@/lib/bookings/group";
import { shouldShowPaymentCountdown } from "@/lib/bookings/payment-expiry";
import { areBookingsEqual } from "@/lib/react/compare";
import type { Booking } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface BookingPaymentPanelProps {
  booking: Booking;
  onSubmitted?: () => void;
  compact?: boolean;
}

function StepBadge({
  icon: StepIcon,
  label,
}: {
  icon: typeof QrCodeIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-muted)]">
        <StepIcon size={12} />
      </span>
      <span className="text-xs font-medium text-[var(--foreground)]">{label}</span>
    </div>
  );
}

function BookingPaymentPanelComponent({
  booking,
  onSubmitted,
  compact = false,
}: BookingPaymentPanelProps) {
  const amount = booking.totalAmount ?? 0;
  const paymentConfigured = useMemo(() => isPaymentConfigured(), []);
  const showCountdown = shouldShowPaymentCountdown(booking);
  const expiryState = usePaymentExpiryCountdown(
    booking.expiresAt,
    showCountdown,
  );
  const paymentExpired = expiryState?.isExpired ?? false;
  const pending = bookingNeedsPayment(booking);
  const relatedBookingIds = useMemo(
    () => getRelatedBookingIds(booking),
    [booking],
  );

  return (
    <section
      className={cn("payment-panel min-w-0 overflow-hidden", compact && "payment-panel--compact")}
    >
      <div className={cn("space-y-4 px-4 py-4", compact && "space-y-3 px-3 py-3 sm:px-4 sm:py-3.5")}>
        <div
          className={cn(
            "flex flex-col gap-2 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3",
            compact && "pb-2.5",
          )}
        >
          <div className="min-w-0">
            <h4 className="payment-panel-heading">Payment required</h4>
            {!compact ? (
              <p className="mt-0.5 text-xs text-[var(--foreground-secondary)]">
                Confirm your slot with UPI payment
              </p>
            ) : null}
          </div>
          {amount > 0 && !compact ? (
            <div className="shrink-0 sm:text-right">
              <p className="text-[10px] font-medium text-[var(--muted)]">Amount</p>
              <p className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                {formatCurrency(amount)}
              </p>
            </div>
          ) : null}
        </div>

        {showCountdown ? (
          <PaymentExpiryCountdown
            booking={booking}
            className={compact ? "space-y-2" : undefined}
            compact={compact}
          />
        ) : null}

        {!paymentExpired && pending ? (
          <div className={cn("space-y-4", compact && "space-y-3")}>
            <div className={cn("space-y-3", compact && "space-y-2.5")}>
              <StepBadge icon={QrCodeIcon} label="Pay via UPI" />
              {paymentConfigured ? (
                <>
                  <UpiPaymentQr
                    amount={amount}
                    size={compact ? 132 : 152}
                    className={cn(
                      "mx-auto w-full",
                      compact ? "max-w-[9.5rem]" : "max-w-[11.5rem]",
                    )}
                  />
                  <div className="relative flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      or pay with app
                    </span>
                    <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                  </div>
                  <UpiPayButtons amount={amount} bookingId={booking.id} />
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] bg-white px-3 py-3 text-center text-[11px] leading-relaxed text-[var(--foreground-secondary)]">
                  Ask staff for UPI details to complete payment.
                </p>
              )}
            </div>

            <div className={cn("space-y-3 border-t border-[var(--border)] pt-4", compact && "space-y-2.5 pt-3")}>
              <StepBadge icon={ReceiptIcon} label="Submit transaction UTR" />
              <BookingUtrForm
                bookingIds={relatedBookingIds}
                mobile={booking.customerPhone}
                onSubmitted={onSubmitted}
                disabled={paymentExpired}
              />
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
    prev.compact === next.compact &&
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const BookingPaymentPanel = memo(
  BookingPaymentPanelComponent,
  paymentPanelPropsAreEqual,
);
