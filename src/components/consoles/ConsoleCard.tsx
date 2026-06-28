"use client";

import Link from "next/link";
import { ConsoleImage } from "@/components/consoles/ConsoleImage";
import { PlatformIcon } from "@/components/consoles/PlatformIcon";
import { ChevronRightIcon, UsersIcon } from "@/components/icons";
import { getPlatformStyle } from "@/lib/platform-styles";
import { formatCurrency, platformLabel } from "@/lib/utils";
import { areConsolesEqual } from "@/lib/react/compare";
import type { GameConsole } from "@/types";
import { memo, useMemo } from "react";

interface ConsoleCardProps {
  console: GameConsole;
}

function ConsoleCardComponent({ console: gameConsole }: ConsoleCardProps) {
  const platform = useMemo(
    () => platformLabel(gameConsole.platform),
    [gameConsole.platform],
  );
  const style = useMemo(
    () => getPlatformStyle(gameConsole.platform),
    [gameConsole.platform],
  );
  const rateLabel = useMemo(
    () => formatCurrency(gameConsole.hourlyRate),
    [gameConsole.hourlyRate],
  );
  const bookHref = useMemo(
    () => `/consoles/${gameConsole.id}`,
    [gameConsole.id],
  );

  return (
    <article className="console-card group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="relative">
        <ConsoleImage
          console={gameConsole}
          className="aspect-[16/10] w-full"
        />
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm"
          style={{
            backgroundColor: `${style.color}ee`,
            color: "#fff",
          }}
        >
          <PlatformIcon platform={gameConsole.platform} size={12} color="#fff" />
          {platform}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-snug text-[var(--foreground)]">
          {gameConsole.name}
        </h3>
        {gameConsole.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground-secondary)]">
            {gameConsole.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-xs text-[var(--muted)]">From</p>
            <p className="text-xl font-bold text-[var(--foreground)]">
              {rateLabel}
              <span className="text-sm font-normal text-[var(--muted)]">/hr</span>
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--foreground-secondary)]">
              <UsersIcon size={14} className="text-[var(--muted)]" />
              Up to {gameConsole.maxPlayers} players
            </p>
          </div>
          <Link
            href={bookHref}
            prefetch={false}
            className="console-card-book inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-md)] px-4 py-2 text-sm font-bold transition active:scale-[0.98]"
          >
            Book
            <ChevronRightIcon size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function consoleCardPropsAreEqual(
  prev: ConsoleCardProps,
  next: ConsoleCardProps,
): boolean {
  return areConsolesEqual(prev.console, next.console);
}

export const ConsoleCard = memo(ConsoleCardComponent, consoleCardPropsAreEqual);
