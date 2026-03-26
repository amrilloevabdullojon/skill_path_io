import { DashboardSectionSkeleton, StatsGridSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <StatsGridSkeleton />
      <DashboardSectionSkeleton rows={4} />
      <DashboardSectionSkeleton rows={3} />
    </div>
  );
}
