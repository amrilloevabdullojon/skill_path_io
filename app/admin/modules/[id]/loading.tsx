import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ModuleDetailLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Edit form skeleton */}
        <div className="surface-elevated space-y-5 p-5 sm:p-7" aria-hidden>
          <Skeleton className="h-5 w-32" />
          {/* Track */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-40" />
          </div>
          {/* Title */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Description */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          {/* Order + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>

        {/* Side info skeleton */}
        <div className="space-y-4" aria-hidden>
          <div className="surface-elevated space-y-3 p-5">
            <Skeleton className="h-5 w-16" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-subtle space-y-1.5 p-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-elevated space-y-3 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
          <div className="surface-elevated p-5">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
