export function ConsolesListSkeleton() {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="h-28 animate-pulse bg-white/5" />
          <div className="space-y-2 p-3.5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="flex justify-between pt-1">
              <div className="h-6 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
