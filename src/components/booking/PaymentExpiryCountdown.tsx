"use client";

import { PaymentAutoCancelNotice } from "@/components/booking/PaymentAutoCancelNotice";
import { usePaymentExpiryCountdown } from "@/hooks/usePaymentExpiryCountdown";
import { shouldShowPaymentCountdown } from "@/lib/bookings/payment-expiry";
import { areBookingsEqual } from "@/lib/react/compare";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";
import { memo } from "react";

interface PaymentExpiryCountdownProps {
  booking: Booking;
  className?: string;
  compact?: boolean;
}

function PaymentExpiryCountdownComponent({
  booking,
  className,
  compact = false,
}: PaymentExpiryCountdownProps) {
  if (!booking) return null;

  const visible = shouldShowPaymentCountdown(booking);
  const state = usePaymentExpiryCountdown(booking.expiresAt, visible);

  if (!visible || !state) return null;

  if (state.isExpired) {
    return (
      <div className={cn("space-y-3", compact && "space-y-2", className)}>
        <div
          className={cn("alert-error text-center", compact ? "px-3 py-2" : "px-4 py-3")}
          role="status"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider">
            Time&apos;s up
          </p>
          <p
            className={cn(
              "mt-1 font-mono font-bold tabular-nums",
              compact ? "text-xl" : "text-2xl",
            )}
          >
            00:00
          </p>
        </div>
        <PaymentAutoCancelNotice expired />
      </div>
    );
  }

  const urgent = state.remainingMs < 5 * 60 * 1000;

  return (
    <div className={cn("space-y-3", compact && "space-y-2", className)}>
      <div
        className={cn("payment-timer", urgent && "payment-timer-urgent")}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            compact ? "px-3 py-2" : "gap-4 px-4 py-3",
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs font-semibold",
                urgent ? "text-[var(--status-danger-text)]" : "text-[var(--status-warning-text)]",
              )}
            >
              {compact ? "Pay within" : "Complete payment within"}
            </p>
            {!compact ? (
              <p className="mt-0.5 text-[11px] text-[var(--foreground-secondary)]">
                Then submit your UTR below
              </p>
            ) : null}
          </div>
          <p
            className={cn(
              "shrink-0 font-mono font-bold tabular-nums leading-none",
              urgent ? "text-[var(--status-danger-text)]" : "text-[var(--status-warning-text)]",
              compact ? "text-xl" : "text-2xl",
            )}
          >
            {state.label}
          </p>
        </div>
      </div>
      {!compact ? <PaymentAutoCancelNotice /> : null}
    </div>
  );
}

function propsAreEqual(
  prev: PaymentExpiryCountdownProps,
  next: PaymentExpiryCountdownProps,
): boolean {
  if (prev === next) return true;
  if (!prev?.booking || !next?.booking) return false;

  return (
    prev.className === next.className &&
    prev.compact === next.compact &&
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const PaymentExpiryCountdown = memo(
  PaymentExpiryCountdownComponent,
  propsAreEqual,
);
