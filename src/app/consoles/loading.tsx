import { ConsolesListSkeleton } from "@/components/consoles/ConsolesListSkeleton";

export default function ConsolesLoading() {
  return (
    <div className="page-shell">
      <div className="mb-5">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-white/5" />
      </div>
      <ConsolesListSkeleton />
    </div>
  );
}
