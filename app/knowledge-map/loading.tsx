import { DashboardSectionSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function KnowledgeMapLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="surface-elevated p-4" aria-hidden>
        <Skeleton className="h-[340px] w-full rounded-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <DashboardSectionSkeleton rows={4} />
        <DashboardSectionSkeleton rows={4} />
        <DashboardSectionSkeleton rows={4} />
      </div>
    </div>
  );
}
