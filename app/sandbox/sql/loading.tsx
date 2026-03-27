import { Skeleton } from "@/components/ui/skeleton";

export default function SqlSandboxLoading() {
  return (
    <div className="space-y-4 p-4 sm:p-6" aria-hidden>
      <div className="surface-elevated space-y-3 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="surface-elevated p-4">
        <Skeleton className="h-[180px] w-full rounded-xl" />
      </div>
    </div>
  );
}
