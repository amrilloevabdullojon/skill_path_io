import { CardGridSkeleton, DashboardSectionSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function CareerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionSkeleton rows={4} />
        <DashboardSectionSkeleton rows={4} />
      </div>
      <CardGridSkeleton cols={3} rows={3} />
    </div>
  );
}
