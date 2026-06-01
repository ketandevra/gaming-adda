/** UPI / QR settings for pending payments (NEXT_PUBLIC_* are available in the browser). */

/** Bundled PhonePe / UPI QR in `public/payment-qr.png`. Override via env if needed. */
export const DEFAULT_PAYMENT_QR_PATH = "/payment-qr.png";

export function getPaymentUpiVpa(): string {
  return process.env.NEXT_PUBLIC_PAYMENT_UPI_VPA?.trim() ?? "";
}

export function getPaymentUpiPayeeName(): string {
  return (
    process.env.NEXT_PUBLIC_PAYMENT_UPI_PAYEE_NAME?.trim() || "The Gaming Adda"
  );
}

/** Static QR image (env override, else bundled `public/payment-qr.png`). */
export function getPaymentQrImageUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PAYMENT_QR_URL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_PAYMENT_QR_PATH;
}

export function isPaymentConfigured(): boolean {
  return Boolean(getPaymentUpiVpa() || getPaymentQrImageUrl());
}
