import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function EditAssignmentLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: form skeleton */}
        <section className="surface-elevated p-6 space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </section>

        {/* Right: sidebar skeleton */}
        <aside className="space-y-4">
          <section className="surface-elevated p-5 space-y-3">
            <Skeleton className="h-4 w-12 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded" />
            ))}
          </section>
          <section className="surface-elevated p-5 space-y-3">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </section>
        </aside>
      </div>
    </section>
  );
}
