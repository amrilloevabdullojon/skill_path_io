import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CaseDetailLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Edit form skeleton */}
        <div className="surface-elevated space-y-5 p-6" aria-hidden>
          {/* Title */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Summary */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          {/* Problem statement */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          {/* Expected approach */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          {/* Outcome */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          {/* Difficulty + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="ml-auto h-7 w-7 rounded-md" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4" aria-hidden>
          <div className="surface-elevated space-y-3 p-5">
            <Skeleton className="h-4 w-8" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-elevated space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
