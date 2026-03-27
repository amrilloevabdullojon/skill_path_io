import { DashboardSectionSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="surface-elevated space-y-6 p-6" aria-hidden>
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-3 w-32 rounded-full" />
          <Skeleton className="mx-auto h-2 w-48 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-36 w-full max-w-xl rounded-2xl" />
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <DashboardSectionSkeleton rows={3} />
    </div>
  );
}
