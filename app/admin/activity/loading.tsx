import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ActivityLogLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      {/* Filter bar skeleton */}
      <div className="surface-elevated p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      {/* Table skeleton */}
      <div
        className="hidden overflow-hidden rounded-xl border border-border md:block"
        aria-hidden
      >
        <div className="flex gap-3 border-b border-border bg-card px-4 py-3">
          {["w-28", "w-40", "w-24", "w-20", "w-28", "w-20", "w-48"].map(
            (w, i) => (
              <Skeleton key={i} className={`h-3 shrink-0 rounded ${w}`} />
            ),
          )}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-4 w-40 shrink-0" />
            <Skeleton className="h-5 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      {/* Mobile skeleton */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="surface-subtle rounded-xl p-4 space-y-2"
            aria-hidden
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </section>
  );
}
