import { cn } from "@/lib/utils";

interface PaymentAutoCancelNoticeProps {
  expired?: boolean;
  className?: string;
}

function InfoIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function PaymentAutoCancelNotice({
  expired = false,
  className,
}: PaymentAutoCancelNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
        expired
          ? "border-red-500/25 bg-red-500/8 text-red-200/90"
          : "border-amber-500/20 bg-amber-500/5 text-[var(--muted)]",
        className,
      )}
      role="note"
    >
      <span className={expired ? "text-red-300" : "text-amber-300/90"}>
        <InfoIcon />
      </span>
      <p>
        {expired ? (
          <>
            <span className="font-semibold text-red-200">
              Payment was not completed in time.
            </span>{" "}
            This booking has been cancelled automatically.
          </>
        ) : (
          <>
            <span className="font-medium text-[var(--foreground)]">
              Important:
            </span>{" "}
            If payment fails or is not completed before the timer ends, this
            booking will be{" "}
            <span className="font-semibold text-amber-200">
              cancelled automatically
            </span>
            .
          </>
        )}
      </p>
    </div>
  );
}
