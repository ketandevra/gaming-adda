export function ConsolesListSkeleton() {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="aspect-[16/10] animate-pulse bg-[var(--surface-elevated)]" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--surface-elevated)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-elevated)]" />
            <div className="flex justify-between pt-2">
              <div className="h-6 w-16 animate-pulse rounded bg-[var(--surface-elevated)]" />
              <div className="h-9 w-16 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-elevated)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
