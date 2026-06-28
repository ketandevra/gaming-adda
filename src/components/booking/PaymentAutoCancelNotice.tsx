import { cn } from "@/lib/utils";
import { InfoIcon } from "@/components/icons";

interface PaymentAutoCancelNoticeProps {
  expired?: boolean;
  className?: string;
}

export function PaymentAutoCancelNotice({
  expired = false,
  className,
}: PaymentAutoCancelNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
        expired ? "alert-error" : "alert-warning",
        className,
      )}
      role="note"
    >
      <span className={expired ? "text-[var(--status-danger-text)]" : "text-[var(--status-warning-text)]"}>
        <InfoIcon size={16} className="mt-0.5" />
      </span>
      <p className={expired ? "text-[var(--status-danger-text)]" : "text-[var(--status-warning-text)]"}>
        {expired ? (
          <>
            <span className="font-semibold">Payment was not completed in time.</span>{" "}
            This booking has been cancelled automatically.
          </>
        ) : (
          <>
            <span className="font-semibold">Important:</span> If payment is not
            completed before the timer ends, this booking will be{" "}
            <span className="font-semibold">cancelled automatically</span>.
          </>
        )}
      </p>
    </div>
  );
}
