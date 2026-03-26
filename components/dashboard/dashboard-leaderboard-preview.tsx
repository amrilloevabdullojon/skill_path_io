import Link from "next/link";
import { Trophy } from "lucide-react";

import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type { DashboardData } from "@/lib/dashboard/data";

type DashboardLeaderboardPreviewProps = {
  leaderboard: DashboardData["leaderboard"];
};

export function DashboardLeaderboardPreviewSection({ leaderboard }: DashboardLeaderboardPreviewProps) {
  return (
    <DashboardSection
      id="leaderboard"
      title="Leaderboard Preview"
      description="Top students this week and your current XP rank."
      actionLabel="Open leaderboard"
      actionHref="/leaderboard"
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Your rank</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {leaderboard.currentUserRank ? `#${leaderboard.currentUserRank}` : "Not ranked yet"}
            </p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Earned XP this week</p>
            <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-amber-300" />
              {leaderboard.earnedXpThisWeek}
            </p>
          </div>
        </div>

        <LeaderboardTable rows={leaderboard.rows} compact />

        <Link href="/leaderboard" className="inline-flex text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200">
          View full ranking
        </Link>
      </div>
    </DashboardSection>
  );
}
