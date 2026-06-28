"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { CheckCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { AdminVerifyPaymentModal } from "@/components/admin/AdminVerifyPaymentModal";
import { BookingCardGuestInfo } from "@/components/booking/BookingCardGuestInfo";
import { BookingCardSchedule } from "@/components/booking/BookingCardSchedule";
import { BookingCardConsoleSummary } from "@/components/booking/BookingCardConsoleSummary";
import { BookingCardNumber } from "@/components/booking/BookingCardNumber";
import { BookingCardTimestamps } from "@/components/booking/BookingCardTimestamps";
import { BookingRefundBanner } from "@/components/booking/BookingRefundBanner";
import {
  isBookingFullyVerified,
  isPendingBooking,
} from "@/lib/bookings/admin-filters";
import { formatPaymentStatusLabel } from "@/lib/bookings/payment";
import {
  isRefundEligibleBooking,
  shouldWatchPaymentExpiry,
} from "@/lib/bookings/refund";
import { utrNumbersMatch } from "@/lib/bookings/utr";
import { usePaymentExpiryCountdown } from "@/hooks/usePaymentExpiryCountdown";
import {
  STATUS_BADGE_CLASS,
  bookingStatusTone,
  paymentStatusTone,
} from "@/lib/bookings/status-styles";
import { verifyBookingPayment } from "@/lib/api/client";
import {
  bookingDisplayStatus,
  formatBookingCardDate,
  formatBookingTimeRange,
  formatCurrency,
  cn,
} from "@/lib/utils";
import type { Booking, GameConsole } from "@/types";

interface AdminBookingRowProps {
  booking: Booking;
  console?: GameConsole | null;
  onUpdated: () => void;
}

function AdminBookingRowComponent({
  booking,
  console: gameConsole,
  onUpdated,
}: AdminBookingRowProps) {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(isBookingFullyVerified(booking));

  const awaitingVerify = useMemo(
    () => isPendingBooking(booking) && !verified,
    [booking, verified],
  );

  const watchExpiry = useMemo(
    () => shouldWatchPaymentExpiry(booking),
    [booking],
  );

  const expiryState = usePaymentExpiryCountdown(
    booking.expiresAt,
    watchExpiry,
  );

  const canVerify = awaitingVerify;

  const showRefund = useMemo(() => {
    if (!shouldWatchPaymentExpiry(booking)) return isRefundEligibleBooking(booking);
    return expiryState?.isExpired === true;
  }, [booking, expiryState?.isExpired]);

  const consoleTitle = booking.consoleName ?? `Console ${booking.consoleId}`;
  const paymentLabel = formatPaymentStatusLabel(booking.paymentStatus);
  const displayStatus = bookingDisplayStatus(booking);
  const hasAmount = booking.totalAmount != null && booking.totalAmount > 0;
  const bookingUtr = booking.utrNumber?.trim() ?? "";

  const openVerifyModal = useCallback(() => {
    setEnteredUtr("");
    setModalError(null);
    setVerifyModalOpen(true);
  }, []);

  const closeVerifyModal = useCallback(() => {
    if (verifying) return;
    setVerifyModalOpen(false);
    setEnteredUtr("");
    setModalError(null);
  }, [verifying]);

  const handleConfirmVerify = useCallback(async () => {
    const entered = enteredUtr.trim();

    if (!entered) {
      setModalError("Enter UTR number");
      return;
    }

    if (!bookingUtr) {
      setModalError("No UTR submitted for this booking");
      return;
    }

    if (!utrNumbersMatch(entered, bookingUtr)) {
      setModalError("UTR does not match");
      return;
    }

    setVerifying(true);
    setModalError(null);

    try {
      await verifyBookingPayment({
        bookingId: booking.id,
        customerPhone: booking.customerPhone,
      });
      setVerified(true);
      setVerifyModalOpen(false);
      setEnteredUtr("");
      onUpdated();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Could not verify payment",
      );
    } finally {
      setVerifying(false);
    }
  }, [booking.customerPhone, booking.id, bookingUtr, enteredUtr, onUpdated]);

  const showFooter = canVerify || showRefund;

  return (
    <>
      <article
        className={cn(
          "user-booking-card admin-booking-card booking-card w-full min-w-0 overflow-hidden",
          canVerify && "user-booking-card--payment",
          showRefund && "user-booking-card--refund",
        )}
      >
        <div className="booking-card-accent" aria-hidden />

        <div className="user-booking-card-body min-w-0">
          <BookingCardNumber bookingId={booking.id} />
          <BookingCardConsoleSummary
            booking={booking}
            console={gameConsole}
            title={consoleTitle}
            badges={
              <>
                <span className={STATUS_BADGE_CLASS[bookingStatusTone(booking)]}>
                  {booking.bookingStatus?.trim() || displayStatus}
                </span>
                {paymentLabel ? (
                  <span
                    className={STATUS_BADGE_CLASS[paymentStatusTone(booking.paymentStatus)]}
                  >
                    {paymentLabel}
                  </span>
                ) : null}
                {verified ? (
                  <span className={STATUS_BADGE_CLASS.success}>Verified</span>
                ) : null}
                {showRefund ? (
                  <span className={STATUS_BADGE_CLASS.danger}>Refund</span>
                ) : null}
              </>
            }
            trailing={
              hasAmount ? (
                <span className="user-booking-amount">
                  {formatCurrency(booking.totalAmount!)}
                </span>
              ) : null
            }
          />

          <BookingCardGuestInfo
            customerName={booking.customerName}
            customerPhone={booking.customerPhone}
          />

          <BookingCardSchedule
            dateLabel={formatBookingCardDate(booking)}
            timeLabel={formatBookingTimeRange(booking.startTime, booking.endTime)}
          />

          <BookingCardTimestamps booking={booking} showUtr={false} />
        </div>

        {showFooter ? (
          <div className="user-booking-card-footer space-y-2">
            {canVerify ? (
              <Button
                type="button"
                fullWidth
                className="sm:inline-flex sm:w-auto"
                onClick={openVerifyModal}
              >
                <CheckCircleIcon size={16} />
                Verify Payment
              </Button>
            ) : showRefund ? (
              <BookingRefundBanner variant="admin" />
            ) : null}
          </div>
        ) : null}
      </article>

      <AdminVerifyPaymentModal
        open={verifyModalOpen}
        bookingId={booking.id}
        utrValue={enteredUtr}
        error={modalError}
        verifying={verifying}
        onUtrChange={setEnteredUtr}
        onClose={closeVerifyModal}
        onConfirm={handleConfirmVerify}
      />
    </>
  );
}

export const AdminBookingRow = memo(AdminBookingRowComponent);
