import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="surface-subtle space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Filter + table */}
      <div className="surface-elevated space-y-3 p-5" aria-hidden>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
