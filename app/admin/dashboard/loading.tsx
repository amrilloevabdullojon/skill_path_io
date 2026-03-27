import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <section className="page-shell">
      {/* Header */}
      <div className="surface-elevated space-y-2 p-5" aria-hidden>
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {/* KPI grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-subtle space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Two columns */}
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="surface-elevated space-y-3 p-5" aria-hidden>
          <Skeleton className="h-5 w-32" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="surface-elevated space-y-3 p-5" aria-hidden>
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
