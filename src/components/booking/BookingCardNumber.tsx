interface BookingCardNumberProps {
  bookingId: string;
}

export function BookingCardNumber({ bookingId }: BookingCardNumberProps) {
  const id = bookingId.trim();
  if (!id) return null;

  return (
    <div className="user-booking-number">
      <span className="user-booking-number-label">Booking number</span>
      <span className="user-booking-number-value">#{id}</span>
    </div>
  );
}
