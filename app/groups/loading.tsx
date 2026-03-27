import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function GroupsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton cols={3} rows={6} />
    </div>
  );
}
