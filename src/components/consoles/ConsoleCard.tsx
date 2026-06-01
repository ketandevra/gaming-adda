"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { formatCurrency, platformLabel } from "@/lib/utils";
import { areConsolesEqual } from "@/lib/react/compare";
import type { GameConsole } from "@/types";
import { Badge } from "@/components/ui/Badge";

const platformEmoji: Record<GameConsole["platform"], string> = {
  playstation: "🎮",
  xbox: "🟢",
  nintendo: "🔴",
  pc: "🖥️",
  vr: "🥽",
  other: "⚡",
};

interface ConsoleCardProps {
  console: GameConsole;
}

function ConsoleCardComponent({ console: gameConsole }: ConsoleCardProps) {
  const platform = useMemo(
    () => platformLabel(gameConsole.platform),
    [gameConsole.platform],
  );
  const emoji = platformEmoji[gameConsole.platform];
  const rateLabel = useMemo(
    () => formatCurrency(gameConsole.hourlyRate),
    [gameConsole.hourlyRate],
  );
  const bookHref = useMemo(
    () => `/consoles/${gameConsole.id}`,
    [gameConsole.id],
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--accent)]/40 hover:shadow-[0_4px_20px_rgba(0,255,198,0.06)]">
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[var(--surface-elevated)] to-black">
        <span className="text-4xl opacity-90 transition group-hover:scale-105">
          {emoji}
        </span>
        <span className="absolute right-2 top-2">
          <Badge variant="accent">{platform}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="text-sm font-semibold leading-tight text-[var(--foreground)]">
            {gameConsole.name}
          </h3>
          {gameConsole.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
              {gameConsole.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-[10px] text-[var(--muted)]">From</p>
            <p className="text-base font-bold leading-none text-[var(--accent)]">
              {rateLabel}
              <span className="text-xs font-normal text-[var(--muted)]">/hr</span>
            </p>
            <p className="text-[10px] text-[var(--muted)]">
              Up to {gameConsole.maxPlayers} players
            </p>
          </div>
          <Link
            href={bookHref}
            prefetch={false}
            className="inline-flex min-h-8 items-center rounded-lg border border-[var(--accent)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black active:scale-[0.98]"
          >
            Book
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
