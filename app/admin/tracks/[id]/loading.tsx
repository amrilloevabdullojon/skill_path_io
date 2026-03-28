import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function TrackDetailLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column: edit form skeleton */}
        <div className="space-y-5" aria-hidden>
          {/* Metadata section */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-24" />
            {/* Title */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Slug */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Description */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            {/* Icon */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Color */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Classification section */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Skills section */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-16" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>

          {/* Learning Outcomes section */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>

          {/* Career Impact section */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        {/* Right column: sidebar skeleton */}
        <div className="space-y-4" aria-hidden>
          {/* Track Info panel */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-20" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats panel */}
          <div className="surface-elevated space-y-4 p-5">
            <Skeleton className="h-5 w-12" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-subtle space-y-1.5 p-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))}
            </div>
          </div>

          {/* Modules panel */}
          <div className="surface-elevated space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
