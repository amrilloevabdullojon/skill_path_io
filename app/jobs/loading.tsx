import { CardGridSkeleton, DashboardSectionSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <DashboardSectionSkeleton rows={3} />
      <CardGridSkeleton cols={2} rows={6} />
    </div>
  );
}
