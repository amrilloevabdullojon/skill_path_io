import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminQuizzesLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated space-y-3 p-5" aria-hidden>
        <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-8 w-20 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}
