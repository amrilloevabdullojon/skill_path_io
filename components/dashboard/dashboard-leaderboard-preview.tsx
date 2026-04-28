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
      title="Рейтинг"
      description="Лучшие студенты недели и твоё текущее место по XP."
      actionLabel="Открыть рейтинг"
      actionHref="/leaderboard"
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">Твоё место</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {leaderboard.currentUserRank ? `#${leaderboard.currentUserRank}` : "Ещё не в рейтинге"}
            </p>
          </div>
          <div className="mini-stat-box p-3">
            <p className="text-xs text-muted-foreground">XP за эту неделю</p>
            <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-amber-300" />
              {leaderboard.earnedXpThisWeek}
            </p>
          </div>
        </div>

        <LeaderboardTable rows={leaderboard.rows} compact />

        <Link href="/leaderboard" className="inline-flex text-xs font-semibold text-indigo-300 transition-colors hover:text-indigo-200">
          Полный рейтинг
        </Link>
      </div>
    </DashboardSection>
  );
}
