import { DashboardSectionSkeleton, PageHeaderSkeleton, StatsGridSkeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <StatsGridSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionSkeleton rows={5} />
        <DashboardSectionSkeleton rows={5} />
      </div>
      <DashboardSectionSkeleton rows={4} />
    </div>
  );
}
