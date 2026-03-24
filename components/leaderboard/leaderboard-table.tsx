import { Crown, Medal, Trophy } from "lucide-react";

import { LevelBadge } from "@/components/level/level-badge";
import { LeaderboardRow } from "@/features/gamification/leaderboard";
import { LevelTier } from "@/lib/progress/xp";

type LeaderboardTableProps = {
  rows: LeaderboardRow[];
  compact?: boolean;
};

function rankIcon(rank: number) {
  if (rank === 1) {
    return <Crown className="h-4 w-4 text-amber-300" />;
  }
  if (rank === 2) {
    return <Trophy className="h-4 w-4 text-slate-300" />;
  }
  if (rank === 3) {
    return <Medal className="h-4 w-4 text-orange-300" />;
  }
  return null;
}

function toLevelTier(value: string): LevelTier {
  if (value === "Explorer" || value === "Professional" || value === "Expert" || value === "Master") {
    return value;
  }
  return "Beginner";
}

export function LeaderboardTable({ rows, compact = false }: LeaderboardTableProps) {
  return (
    <div className="table-shell">
      <table className="table-base min-w-[760px]">
        <thead className="table-head">
          <tr>
            <th>#</th>
            <th>User</th>
            <th>XP</th>
            <th>Level</th>
            {!compact && <th>Modules</th>}
            {!compact && <th>Certificates</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId} className="table-row">
              <td className="inline-flex items-center gap-2 px-3 py-3 font-semibold text-slate-200">
                {rankIcon(row.rank)}
                {row.rank}
              </td>
              <td className="px-3 py-3">
                <p className="font-medium text-slate-100">{row.name}</p>
                <p className="text-xs text-slate-500">{row.email}</p>
              </td>
              <td className="px-3 py-3 font-semibold text-sky-300">{row.xp}</td>
              <td className="px-3 py-3">
                <LevelBadge level={toLevelTier(row.level)} />
              </td>
              {!compact && <td className="px-3 py-3 text-slate-300">{row.completedModules}</td>}
              {!compact && <td className="px-3 py-3 text-slate-300">{row.certificates}</td>}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-slate-400" colSpan={compact ? 4 : 6}>
                No leaderboard data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
