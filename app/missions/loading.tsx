import { DashboardSectionSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function MissionsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="surface-elevated space-y-3 p-5 sm:p-6">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardSectionSkeleton rows={4} />
        <DashboardSectionSkeleton rows={5} />
      </div>
    </div>
  );
}
