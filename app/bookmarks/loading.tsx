import { CardGridSkeleton, FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function BookmarksLoading() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={2} />
      <CardGridSkeleton cols={2} rows={4} />
    </div>
  );
}
