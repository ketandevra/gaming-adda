"use client";

import { useCallback, useEffect, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReceiptIcon } from "@/components/icons";

interface AdminVerifyPaymentModalProps {
  open: boolean;
  bookingId: string;
  utrValue: string;
  error: string | null;
  verifying: boolean;
  onUtrChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminVerifyPaymentModal({
  open,
  bookingId,
  utrValue,
  error,
  verifying,
  onUtrChange,
  onClose,
  onConfirm,
}: AdminVerifyPaymentModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(() => {
    if (!verifying) onClose();
  }, [onClose, verifying]);

  if (!open) return null;

  return (
    <div
      className="admin-verify-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="admin-verify-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-verify-modal-header">
          <h2 id={titleId} className="admin-verify-modal-title">
            Verify Payment
          </h2>
          <p className="admin-verify-modal-subtitle">
            Enter the UTR for booking #{bookingId} and confirm it matches the
            submitted payment reference.
          </p>
        </div>

        <div className="admin-verify-modal-body space-y-3">
          <Input
            label={
              <span className="inline-flex items-center gap-1.5">
                <ReceiptIcon size={14} className="text-[var(--muted)]" />
                UTR Number
              </span>
            }
            name="adminVerifyUtr"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter UTR number"
            value={utrValue}
            autoFocus
            onChange={(event) => onUtrChange(event.target.value)}
            disabled={verifying}
          />

          {error ? (
            <p className="alert-error rounded-[var(--radius-md)] px-3 py-2 text-xs">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            fullWidth
            disabled={verifying || !utrValue.trim()}
            onClick={onConfirm}
          >
            {verifying ? "Verifying…" : "Confirm"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={verifying}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
