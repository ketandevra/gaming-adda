"use client";

import { getPaymentExpiryState } from "@/lib/bookings/payment-expiry";
import { useEffect, useState } from "react";

export function usePaymentExpiryCountdown(
  expiresAt: string | undefined,
  active: boolean,
) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !expiresAt) return;

    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, expiresAt]);

  if (!active || !expiresAt) return null;
  return getPaymentExpiryState(expiresAt, now);
}
