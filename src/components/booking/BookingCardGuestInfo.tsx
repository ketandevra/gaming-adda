import { PhoneIcon, UserIcon } from "@/components/icons";

interface BookingCardGuestInfoProps {
  customerName?: string;
  customerPhone?: string;
}

function formatGuestName(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "—";
}

function formatGuestPhone(phone?: string): string {
  const trimmed = phone?.trim();
  return trimmed ? trimmed : "—";
}

export function BookingCardGuestInfo({
  customerName,
  customerPhone,
}: BookingCardGuestInfoProps) {
  const name = formatGuestName(customerName);
  const phone = formatGuestPhone(customerPhone);
  const phoneHref = customerPhone?.trim() ? `tel:${customerPhone.trim()}` : undefined;

  return (
    <div className="user-booking-guest">
      <div className="user-booking-guest-group">
        <span className="user-booking-guest-icon-wrap" aria-hidden>
          <UserIcon size={15} />
        </span>
        <div className="user-booking-guest-copy">
          <span className="user-booking-guest-label">Customer</span>
          <span className="user-booking-guest-value">{name}</span>
        </div>
      </div>
      <div className="user-booking-guest-group">
        <span className="user-booking-guest-icon-wrap" aria-hidden>
          <PhoneIcon size={15} />
        </span>
        <div className="user-booking-guest-copy">
          <span className="user-booking-guest-label">Mobile</span>
          {phoneHref ? (
            <a href={phoneHref} className="user-booking-guest-value user-booking-guest-value--phone">
              {phone}
            </a>
          ) : (
            <span className="user-booking-guest-value">{phone}</span>
          )}
        </div>
      </div>
    </div>
  );
}
