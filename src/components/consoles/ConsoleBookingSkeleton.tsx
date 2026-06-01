export function ConsoleBookingSkeleton() {
  return (
    <div className="page-shell">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:gap-5">
        <div>
          <div className="h-5 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="mt-2 h-7 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-3 flex gap-6">
            <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
            <div className="h-4 w-28 animate-pulse rounded bg-white/5" />
          </div>
          <div className="mt-6">
            <div className="mb-3 flex justify-between gap-4">
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-9 w-32 animate-pulse rounded-lg bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            </div>
          </div>
        </div>
        <aside className="section-card p-3.5">
          <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
            <div className="h-9 w-full animate-pulse rounded-lg bg-white/10" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-white/10" />
          </div>
        </aside>
      </div>
    </div>
  );
}
