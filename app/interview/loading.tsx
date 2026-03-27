import { DashboardSectionSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function InterviewLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardSectionSkeleton rows={5} />
        <div className="surface-elevated space-y-4 p-5" aria-hidden>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
