import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated space-y-6 p-5 sm:p-7" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </section>
  );
}
