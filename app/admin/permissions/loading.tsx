import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminPermissionsLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated overflow-hidden rounded-xl border border-border" aria-hidden>
        <div className="flex gap-3 border-b border-border bg-card px-4 py-3">
          {["w-48", "w-28", "w-56", "w-20", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-3 shrink-0 rounded ${w}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-48 shrink-0" />
            <Skeleton className="h-5 w-28 shrink-0 rounded-lg" />
            <div className="flex flex-1 gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-5 w-20 shrink-0 rounded-lg" />
            <Skeleton className="h-4 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
