import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function EditQuizLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <section className="surface-elevated p-5 space-y-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </section>
          <section className="surface-elevated p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </section>
        </aside>
        <div className="space-y-4">
          <section className="surface-elevated p-5 space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </section>
          <section className="surface-elevated p-5 space-y-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </section>
        </div>
      </div>
    </section>
  );
}
