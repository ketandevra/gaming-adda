import { getPaymentUpiPayeeName, getPaymentUpiVpa } from "./config";

export function buildUpiPaymentUrl(params: {
  amount: number;
  bookingId: string;
  vpa?: string;
  payeeName?: string;
}): string | null {
  const vpa = params.vpa ?? getPaymentUpiVpa();
  if (!vpa) return null;

  const payeeName = params.payeeName ?? getPaymentUpiPayeeName();
  const amount = params.amount.toFixed(2);
  const note = `Booking ${params.bookingId}`;

  const query = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount,
    cu: "INR",
    tn: note,
  });

  return `upi://pay?${query.toString()}`;
}

export function buildPaymentQrImageUrl(paymentUrl: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(paymentUrl)}`;
}
