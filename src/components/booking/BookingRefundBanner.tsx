"use client";

import { InfoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface BookingRefundBannerProps {
  className?: string;
  variant?: "user" | "admin";
}

export function BookingRefundBanner({
  className,
  variant = "user",
}: BookingRefundBannerProps) {
  return (
    <div
      className={cn("user-booking-refund-banner", className)}
      role="status"
    >
      <InfoIcon size={15} className="shrink-0" />
      <span>
        {variant === "admin"
          ? "Refund — booking stayed Reserved with UTR submitted and was not confirmed."
          : "Refund — your payment was not confirmed. Contact staff if you need help."}
      </span>
    </div>
  );
}
