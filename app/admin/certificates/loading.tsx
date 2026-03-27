import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminCertificatesLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated p-5" aria-hidden>
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
      <div className="surface-elevated space-y-3 p-5" aria-hidden>
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <div className="flex gap-3 border-b border-border pb-2">
            {["w-20", "w-24", "w-44", "w-36", "w-56", "w-16"].map((w, i) => (
              <Skeleton key={i} className={`h-3 shrink-0 rounded ${w}`} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-4 w-20 shrink-0" />
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-4 w-44 shrink-0" />
              <Skeleton className="h-4 w-36 shrink-0" />
              <Skeleton className="h-9 w-56 shrink-0 rounded-xl" />
              <Skeleton className="h-8 w-14 shrink-0 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
