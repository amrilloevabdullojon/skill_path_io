import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminAuditLogLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated overflow-hidden rounded-xl border border-border" aria-hidden>
        <div className="flex gap-3 border-b border-border bg-card px-4 py-3">
          {["w-28", "w-40", "w-24", "w-20", "w-32", "w-48"].map((w, i) => (
            <Skeleton key={i} className={`h-3 shrink-0 rounded ${w}`} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-4 w-40 shrink-0" />
            <Skeleton className="h-5 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </section>
  );
}
