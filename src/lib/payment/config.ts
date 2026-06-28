/** UPI settings for pending payments (NEXT_PUBLIC_* are available in the browser). */

/** Default UPI payee when env is not set (override via NEXT_PUBLIC_PAYMENT_UPI_*). */
export const DEFAULT_PAYMENT_UPI_VPA = "gplpali@ybl";
export const DEFAULT_PAYMENT_UPI_PAYEE_NAME = "GPL Pali";

export function getPaymentUpiVpa(): string {
  return (
    process.env.NEXT_PUBLIC_PAYMENT_UPI_VPA?.trim() || DEFAULT_PAYMENT_UPI_VPA
  );
}

export function getPaymentUpiPayeeName(): string {
  return (
    process.env.NEXT_PUBLIC_PAYMENT_UPI_PAYEE_NAME?.trim() ||
    DEFAULT_PAYMENT_UPI_PAYEE_NAME
  );
}

export function isPaymentConfigured(): boolean {
  return Boolean(getPaymentUpiVpa());
}
