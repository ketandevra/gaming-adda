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
}

function PaymentExpiryCountdownComponent({
  booking,
  className,
}: PaymentExpiryCountdownProps) {
  if (!booking) return null;

  const visible = shouldShowPaymentCountdown(booking);
  const state = usePaymentExpiryCountdown(booking.expiresAt, visible);

  if (!visible || !state) return null;

  if (state.isExpired) {
    return (
      <div className={cn("space-y-3", className)}>
        <div
          className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-center"
          role="status"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-300/90">
            Time&apos;s up
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-red-200">
            00:00
          </p>
        </div>
        <PaymentAutoCancelNotice expired />
      </div>
    );
  }

  const urgent = state.remainingMs < 5 * 60 * 1000;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          urgent
            ? "border-red-500/40 bg-gradient-to-br from-red-500/12 to-red-500/5"
            : "border-amber-500/35 bg-gradient-to-br from-amber-500/12 to-amber-500/5",
        )}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                urgent ? "bg-red-500/20" : "bg-amber-500/20",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 animate-pulse rounded-full",
                  urgent ? "bg-red-400" : "bg-amber-400",
                )}
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  urgent ? "text-red-200" : "text-amber-200",
                )}
              >
                Complete payment within
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                Then submit your UTR below
              </p>
            </div>
          </div>
          <p
            className={cn(
              "shrink-0 font-mono text-2xl font-bold tabular-nums leading-none tracking-tight",
              urgent ? "text-red-100" : "text-amber-50",
            )}
          >
            {state.label}
          </p>
        </div>
      </div>
      <PaymentAutoCancelNotice />
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
    areBookingsEqual(prev.booking, next.booking)
  );
}

export const PaymentExpiryCountdown = memo(
  PaymentExpiryCountdownComponent,
  propsAreEqual,
);
