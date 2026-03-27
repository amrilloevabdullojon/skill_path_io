import { PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AdminMediaLoading() {
  return (
    <section className="page-shell">
      <PageHeaderSkeleton />
      <div className="surface-elevated p-5" aria-hidden>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="surface-elevated overflow-hidden rounded-xl">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-1.5 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
