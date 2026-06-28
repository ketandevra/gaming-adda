"use client";

import { memo, useMemo, type ReactNode } from "react";
import { ConsoleImage } from "@/components/consoles/ConsoleImage";
import { cn } from "@/lib/utils";
import type { Booking, GameConsole } from "@/types";

interface BookingCardConsoleSummaryProps {
  booking: Pick<Booking, "consoleId" | "consoleName">;
  console?: GameConsole | null;
  title: string;
  badges: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

function BookingCardConsoleSummaryComponent({
  booking,
  console: gameConsole,
  title,
  badges,
  trailing,
  className,
}: BookingCardConsoleSummaryProps) {
  const imageConsole = useMemo(
    () =>
      gameConsole ?? {
        id: booking.consoleId,
        name: title,
        platform: "playstation" as const,
      },
    [booking.consoleId, gameConsole, title],
  );

  return (
    <div className={cn("user-booking-card-console-block", className)}>
      <div className="user-booking-card-console-grid">
        <ConsoleImage
          console={imageConsole}
          className="user-booking-console-thumb"
          sizes="52px"
          showOverlay={false}
        />
        <div className="user-booking-card-console-content">
          <div className="user-booking-card-title-row">
            <h3 className="user-booking-card-title">{title}</h3>
            {trailing}
          </div>
          <div className="user-booking-card-badges">{badges}</div>
        </div>
      </div>
    </div>
  );
}

export const BookingCardConsoleSummary = memo(BookingCardConsoleSummaryComponent);
