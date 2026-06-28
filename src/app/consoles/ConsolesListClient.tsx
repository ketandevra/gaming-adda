"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsoleCard } from "@/components/consoles/ConsoleCard";
import { ConsolesListSkeleton } from "@/components/consoles/ConsolesListSkeleton";
import { GamepadIcon } from "@/components/icons";
import { useHasMounted } from "@/hooks/useHasMounted";
import { fetchConsoles } from "@/lib/api/client";
import { getCached } from "@/lib/api/cache";
import type { GameConsole } from "@/types";

const CONSOLES_CACHE_KEY = "consoles:all";

export function ConsolesListClient() {
  const mounted = useHasMounted();
  const [consoles, setConsoles] = useState<GameConsole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;

    const cached = getCached<GameConsole[]>(CONSOLES_CACHE_KEY);
    if (cached?.length) {
      setConsoles(cached);
      setLoading(false);
    }

    let cancelled = false;

    fetchConsoles()
      .then((data) => {
        if (!cancelled) setConsoles(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load consoles",
          );
          if (!cached?.length) setConsoles([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const consoleCards = useMemo(
    () => consoles.map((c) => <ConsoleCard key={c.id} console={c} />),
    [consoles],
  );

  const showSkeleton = !mounted || (loading && consoles.length === 0);

  if (showSkeleton) {
    return <ConsolesListSkeleton />;
  }

  return (
    <>
      {error ? (
        <p className="mb-4 alert-error rounded-xl px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {loading && consoles.length > 0 ? (
        <p className="mb-4 text-xs text-[var(--muted)]">Refreshing consoles…</p>
      ) : null}

      {consoles.length === 0 ? (
        <div className="bookings-empty rounded-2xl border border-dashed border-[var(--border)]">
          <div className="bookings-empty-icon" aria-hidden>
            <GamepadIcon size={28} strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
            No consoles available right now
          </p>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {consoleCards}
        </div>
      )}
    </>
  );
}
