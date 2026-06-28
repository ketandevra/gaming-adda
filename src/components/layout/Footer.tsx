import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { MapPinIcon, PhoneIcon } from "@/components/icons";
import {
  GAMING_ADDA_ADDRESS,
  GAMING_ADDA_MAPS_URL,
  GAMING_ADDA_PHONES,
} from "@/lib/contact";

export function Footer() {
  const primaryPhone = GAMING_ADDA_PHONES[0];

  return (
    <>
      <footer className="site-contact-strip md:hidden">
        <div className="site-contact-strip-inner">
          <p className="site-contact-strip-kicker">Help &amp; support</p>
          <p className="site-contact-strip-address">{GAMING_ADDA_ADDRESS}</p>

          <div className="site-contact-strip-actions">
            <a
              href={GAMING_ADDA_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-contact-strip-btn site-contact-strip-btn--maps"
            >
              <MapPinIcon size={17} className="shrink-0" />
              <span>Directions</span>
            </a>
            <a
              href={`tel:${primaryPhone}`}
              className="site-contact-strip-btn site-contact-strip-btn--call"
            >
              <PhoneIcon size={17} className="shrink-0" />
              <span>Call us</span>
            </a>
          </div>

          <div className="site-contact-strip-phones">
            {GAMING_ADDA_PHONES.map((phone, index) => (
              <span key={phone} className="site-contact-strip-phone-item">
                {index > 0 ? (
                  <span className="site-contact-strip-phone-sep" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <a href={`tel:${phone}`}>{phone}</a>
              </span>
            ))}
          </div>
        </div>
      </footer>

      <footer className="site-footer mt-auto hidden border-t border-[var(--border)] bg-[var(--surface)] md:block">
        <div className="site-footer-inner mx-auto max-w-6xl px-6 py-8">
          <div className="site-footer-grid">
            <div className="site-footer-brand">
              <div className="flex items-center gap-3">
                <Logo size={36} />
                <div>
                  <p className="font-bold text-[var(--foreground)]">The Gaming Adda</p>
                  <p className="mt-0.5 text-sm text-[var(--foreground-secondary)]">
                    Book. Play. Enjoy.
                  </p>
                </div>
              </div>
            </div>

            <div className="site-footer-contact">
              <h2 className="site-footer-heading">Contact</h2>
              <div className="site-footer-contact-list">
                <a
                  href={GAMING_ADDA_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-contact-item site-footer-contact-item--link"
                >
                  <MapPinIcon size={15} className="shrink-0" />
                  <span>{GAMING_ADDA_ADDRESS}</span>
                </a>
                <div className="site-footer-phones">
                  {GAMING_ADDA_PHONES.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone}`}
                      className="site-footer-contact-item site-footer-contact-item--link"
                    >
                      <PhoneIcon size={15} className="shrink-0" />
                      <span>{phone}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="site-footer-links">
              <h2 className="site-footer-heading">Quick links</h2>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/consoles" className="site-footer-link">
                  Consoles
                </Link>
                <Link href="/bookings" className="site-footer-link">
                  My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
