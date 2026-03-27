import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function EditLessonLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="surface-elevated p-6 space-y-5">
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </section>
        <aside className="space-y-4">
          <section className="surface-elevated p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </section>
          <section className="surface-elevated p-5 space-y-2">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </section>
        </aside>
      </div>
    </section>
  );
}
