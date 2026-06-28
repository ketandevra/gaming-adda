"use client";

import { useMemo } from "react";
import { UpiAppLogo } from "@/components/payment/UpiAppLogo";
import { getUpiAppUrls } from "@/lib/payment/upi";
import { cn } from "@/lib/utils";

interface UpiPayButtonsProps {
  amount: number;
  bookingId: string;
  size?: "md" | "lg";
  className?: string;
}

export function UpiPayButtons({
  amount,
  bookingId,
  size = "md",
  className,
}: UpiPayButtonsProps) {
  const payParams = useMemo(
    () => ({ amount, bookingId }),
    [amount, bookingId],
  );
  const appLinks = useMemo(() => getUpiAppUrls(payParams), [payParams]);

  if (appLinks.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {appLinks.map(({ app, url }) => (
        <a
          key={app.id}
          href={url}
          className={cn(
            "upi-app-pay-btn",
            app.id === "phonepe"
              ? "upi-app-pay-btn--phonepe"
              : "upi-app-pay-btn--paytm",
            size === "lg" && "upi-app-pay-btn--lg",
          )}
        >
          <span className="upi-app-pay-btn__icon" aria-hidden>
            <UpiAppLogo appId={app.id} />
          </span>
          <span className="upi-app-pay-btn__label">{app.label}</span>
        </a>
      ))}
    </div>
  );
}
