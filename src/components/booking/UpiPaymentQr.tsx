"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCodeIcon } from "@/components/icons";
import { buildUpiQrUrl } from "@/lib/payment/upi";
import { cn } from "@/lib/utils";

interface UpiPaymentQrProps {
  amount: number;
  size?: number;
  className?: string;
}

export function UpiPaymentQr({
  amount,
  size = 200,
  className,
}: UpiPaymentQrProps) {
  const upiUrl = useMemo(() => buildUpiQrUrl({ amount }), [amount]);

  if (!upiUrl) return null;

  return (
    <div className={cn("flex w-full min-w-0 flex-col items-center gap-2", className)}>
      <div className="w-full max-w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-2.5 sm:p-3">
        <QRCodeSVG
          value={upiUrl}
          size={size}
          level="M"
          marginSize={2}
          aria-label="UPI payment QR code"
          className="mx-auto block h-auto max-w-full"
        />
      </div>
      <p className="inline-flex max-w-full items-center justify-center gap-1.5 px-1 text-center text-xs text-[var(--foreground-secondary)]">
        <QrCodeIcon size={14} className="shrink-0 text-[var(--muted)]" />
        Scan with PhonePe, Paytm, or any UPI app
      </p>
    </div>
  );
}
