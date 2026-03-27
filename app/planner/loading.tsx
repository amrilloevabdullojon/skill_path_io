import { DashboardSectionSkeleton, PageHeaderSkeleton, StatsGridSkeleton } from "@/components/ui/skeleton";

export default function PlannerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <StatsGridSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionSkeleton rows={6} />
        <DashboardSectionSkeleton rows={4} />
      </div>
    </div>
  );
}
