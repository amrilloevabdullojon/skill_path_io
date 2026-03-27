import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminTracksLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated p-5" aria-hidden>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
      <div className="surface-elevated space-y-3 p-5" aria-hidden>
        <Skeleton className="h-4 w-20" />
        <div className="space-y-3">
          <div className="flex gap-3 border-b border-border pb-2">
            {["w-20", "w-24", "w-40", "w-48", "w-28", "w-16", "w-16", "w-16"].map((w, i) => (
              <Skeleton key={i} className={`h-3 shrink-0 rounded ${w}`} />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-20 shrink-0 space-y-1.5">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-9 min-w-[160px] flex-1 rounded-xl" />
              <Skeleton className="h-9 min-w-[200px] flex-1 rounded-xl" />
              <div className="flex w-28 shrink-0 items-center gap-2">
                <Skeleton className="h-5 w-5 shrink-0 rounded" />
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-8 shrink-0" />
              <Skeleton className="h-4 w-8 shrink-0" />
              <Skeleton className="h-8 w-14 shrink-0 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
