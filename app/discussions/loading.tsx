import { DashboardSectionSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function DiscussionsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.55fr]">
        <DashboardSectionSkeleton rows={6} />
        <DashboardSectionSkeleton rows={4} />
      </div>
    </div>
  );
}
