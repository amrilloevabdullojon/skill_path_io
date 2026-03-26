import { LeaderboardSkeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-36 rounded-xl" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>
      <LeaderboardSkeleton rows={10} />
    </div>
  );
}
