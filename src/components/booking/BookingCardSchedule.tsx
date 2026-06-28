import { CalendarIcon, ClockIcon } from "@/components/icons";
import type { BookingSlotLine } from "@/lib/bookings/group";

interface BookingCardScheduleProps {
  dateLabel: string;
  timeLabel?: string;
  slotLines?: BookingSlotLine[];
}

export function BookingCardSchedule({
  dateLabel,
  timeLabel,
  slotLines = [],
}: BookingCardScheduleProps) {
  const hasMultipleSlots = slotLines.length > 1;

  return (
    <div className="user-booking-schedule">
      <div className="user-booking-schedule-part">
        <CalendarIcon size={14} className="user-booking-schedule-icon" />
        <span className="user-booking-schedule-value">{dateLabel}</span>
      </div>
      {hasMultipleSlots ? (
        <div className="user-booking-schedule-slots">
          {slotLines.map((line) => (
            <span key={line.label} className="user-booking-schedule-slot">
              {line.label}
            </span>
          ))}
        </div>
      ) : timeLabel ? (
        <>
          <span className="user-booking-schedule-divider" aria-hidden />
          <div className="user-booking-schedule-part">
            <ClockIcon size={14} className="user-booking-schedule-icon" />
            <span className="user-booking-schedule-value">{timeLabel}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
