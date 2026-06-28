import { getPaymentUpiPayeeName, getPaymentUpiVpa } from "./config";

export const UPI_APPS = [
  { id: "phonepe", label: "PhonePe", scheme: "phonepe", path: "pay" },
  { id: "paytm", label: "Paytm", scheme: "paytmmp", path: "upi/pay" },
] as const;

export type UpiAppId = (typeof UPI_APPS)[number]["id"];

type ResolvedUpiParams = {
  vpa: string;
  payeeName: string;
  amount: string;
  note: string;
  transactionRef: string;
};

function upiParam(value: string): string {
  return encodeURIComponent(value);
}

function resolveUpiParams(params: {
  amount: number;
  bookingId: string;
  vpa?: string;
  payeeName?: string;
}): ResolvedUpiParams | null {
  const vpa = params.vpa ?? getPaymentUpiVpa();
  if (!vpa || params.amount <= 0) return null;

  const transactionRef = params.bookingId.trim();
  if (!transactionRef) return null;

  return {
    vpa,
    payeeName: params.payeeName ?? getPaymentUpiPayeeName(),
    amount: params.amount.toFixed(2),
    note: params.bookingId,
    transactionRef,
  };
}

/**
 * NPCI UPI linking params.
 * - am: pre-fills amount (2 decimal places)
 * - mam=null: locks amount field (non-editable)
 * - tr/tid: required by several PSPs to honour am
 */
function buildUpiQuery(resolved: ResolvedUpiParams): string {
  return (
    `pa=${upiParam(resolved.vpa)}` +
    `&pn=${upiParam(resolved.payeeName)}` +
    `&tr=${upiParam(resolved.transactionRef)}` +
    `&tid=${upiParam(resolved.transactionRef)}` +
    `&tn=${upiParam(resolved.note)}` +
    `&am=${resolved.amount}` +
    `&mam=null` +
    `&cu=INR`
  );
}

export function buildUpiPaymentUrl(params: {
  amount: number;
  bookingId: string;
  vpa?: string;
  payeeName?: string;
}): string | null {
  const resolved = resolveUpiParams(params);
  if (!resolved) return null;
  return `upi://pay?${buildUpiQuery(resolved)}`;
}

/** Simple UPI URL for QR codes: pa, pn, am, cu. */
export function buildUpiQrUrl(params: {
  amount: number;
  vpa?: string;
  payeeName?: string;
}): string | null {
  const vpa = params.vpa ?? getPaymentUpiVpa();
  if (!vpa || params.amount <= 0) return null;

  const payeeName = params.payeeName ?? getPaymentUpiPayeeName();
  const amount = params.amount.toFixed(2);

  return (
    `upi://pay?pa=${upiParam(vpa)}` +
    `&pn=${upiParam(payeeName)}` +
    `&am=${amount}` +
    `&cu=INR`
  );
}

/** App-specific deep link — bypasses generic upi:// handler (e.g. WhatsApp). */
export function buildUpiAppUrl(
  appId: UpiAppId,
  params: {
    amount: number;
    bookingId: string;
    vpa?: string;
    payeeName?: string;
  },
): string | null {
  const app = UPI_APPS.find((entry) => entry.id === appId);
  const resolved = resolveUpiParams(params);
  if (!app || !resolved) return null;

  return `${app.scheme}://${app.path}?${buildUpiQuery(resolved)}`;
}

export function getUpiAppUrls(params: {
  amount: number;
  bookingId: string;
  vpa?: string;
  payeeName?: string;
}): Array<{ app: (typeof UPI_APPS)[number]; url: string }> {
  return UPI_APPS.flatMap((app) => {
    const url = buildUpiAppUrl(app.id, params);
    return url ? [{ app, url }] : [];
  });
}
