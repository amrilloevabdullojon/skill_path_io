import { TrackCardSkeleton } from "@/components/ui/skeleton";

export default function TracksLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
