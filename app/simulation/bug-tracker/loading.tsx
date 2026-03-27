import { DashboardSectionSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BugTrackerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardSectionSkeleton rows={5} />
        <div className="surface-elevated space-y-4 p-5" aria-hidden>
          <Skeleton className="h-5 w-44" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
