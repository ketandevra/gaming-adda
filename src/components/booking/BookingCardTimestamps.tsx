"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { useToast } from "@/contexts/ToastContext";
import { cn, copyTextToClipboard, copyTextToClipboardAsync, formatDateTime } from "@/lib/utils";
import type { Booking } from "@/types";

function formatTimestamp(value?: string): string {
  if (!value?.trim()) return "—";
  return formatDateTime(value);
}

function formatUtr(value?: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

interface BookingCardTimestampsProps {
  booking: Booking;
  showUtr?: boolean;
}

export function BookingCardTimestamps({
  booking,
  showUtr = true,
}: BookingCardTimestampsProps) {
  const { showToast } = useToast();
  const bookedAt = booking.createdAt ?? booking.bookedAt;
  const expiresAt = booking.expiresAt;
  const utrNumber = booking.utrNumber?.trim();
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const markCopied = useCallback(() => {
    setCopied(true);
    showToast("UTR copied");
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [showToast]);

  const handleCopyUtr = useCallback(() => {
    if (!utrNumber) return;

    if (copyTextToClipboard(utrNumber)) {
      markCopied();
      return;
    }

    void copyTextToClipboardAsync(utrNumber).then((success) => {
      if (success) {
        markCopied();
        return;
      }
      showToast("Could not copy UTR");
    });
  }, [markCopied, showToast, utrNumber]);

  if (!bookedAt && !expiresAt && (!showUtr || !utrNumber)) return null;

  return (
    <div className="user-booking-timestamps">
      <div className="user-booking-timestamp-row">
        <span className="user-booking-timestamp-label">Booked at:</span>
        <span className="user-booking-timestamp-value">{formatTimestamp(bookedAt)}</span>
      </div>
      <div className="user-booking-timestamp-row">
        <span className="user-booking-timestamp-label">Expire at:</span>
        <span className="user-booking-timestamp-value">{formatTimestamp(expiresAt)}</span>
      </div>
      {showUtr ? (
        <div className="user-booking-timestamp-row user-booking-utr-row">
        <span className="user-booking-timestamp-label">UTR Number:</span>
        <div className="user-booking-utr-value-row">
          <span
            className={cn(
              "user-booking-timestamp-value",
              utrNumber && "user-booking-timestamp-value--mono",
            )}
          >
            {formatUtr(utrNumber)}
          </span>
          {utrNumber ? (
            <button
              type="button"
              className={cn(
                "user-booking-copy-btn",
                copied && "user-booking-copy-btn--copied",
              )}
              aria-label={copied ? "UTR copied" : "Copy UTR number"}
              title={copied ? "Copied" : "Copy UTR number"}
              onClick={handleCopyUtr}
            >
              {copied ? (
                <>
                  <CheckIcon size={14} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          ) : null}
        </div>
        </div>
      ) : null}
    </div>
  );
}
