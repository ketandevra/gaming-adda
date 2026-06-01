"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsoleCard } from "@/components/consoles/ConsoleCard";
import { ConsolesListSkeleton } from "@/components/consoles/ConsolesListSkeleton";
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
        <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {loading && consoles.length > 0 ? (
        <p className="mb-4 text-xs text-[var(--muted)]">Refreshing consoles…</p>
      ) : null}

      {consoles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
          No consoles available right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {consoleCards}
        </div>
      )}
    </>
  );
}
