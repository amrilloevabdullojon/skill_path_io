"use client";

import { useState } from "react";
import { Crown, Medal, Trophy, Flame, Shield, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { EmptyState } from "@/components/ui/empty-state";
import { LevelBadge } from "@/components/level/level-badge";
import { GroupedLeaderboard, LeaderboardRow, LeagueTier } from "@/features/gamification/leaderboard";
import { LevelTier } from "@/lib/progress/xp";
import { cn } from "@/lib/utils";

const LEVEL_TIERS: LevelTier[] = ["Beginner", "Explorer", "Professional", "Expert", "Master"];
const isLevelTier = (value: string): value is LevelTier =>
  (LEVEL_TIERS as string[]).includes(value);
const toLevelTier = (value: string): LevelTier => (isLevelTier(value) ? value : "Beginner");

type LeaderboardTableProps = {
  grouped?: GroupedLeaderboard;
  rows?: LeaderboardRow[];
  compact?: boolean;
};

const LEAGUES: { id: LeagueTier; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { id: "Diamond", label: "Алмазная", icon: <Crown className="h-4 w-4" />, color: "text-indigo-300", bg: "bg-indigo-500/10 border-indigo-400/30" },
  { id: "Gold", label: "Золотая", icon: <Trophy className="h-4 w-4" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-400/30" },
  { id: "Silver", label: "Серебряная", icon: <Medal className="h-4 w-4" />, color: "text-slate-300", bg: "bg-slate-500/10 border-slate-400/30" },
  { id: "Bronze", label: "Бронзовая", icon: <Shield className="h-4 w-4" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30" },
];

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-300" />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-slate-300" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export function LeaderboardTable({ grouped, rows, compact }: LeaderboardTableProps) {
  const [activeLeague, setActiveLeague] = useState<LeagueTier>("Bronze");

  if (rows) {
    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <article
            key={row.userId}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-4 surface-elevated rounded-2xl border border-border/50 hover:border-border transition-colors group",
              compact ? "p-3" : "p-4"
            )}
          >
            <div className="flex items-center gap-4">
               <div className="w-8 shrink-0 flex justify-center">
                 {rankIcon(row.rank)}
               </div>
               
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/50 shrink-0 text-base font-bold uppercase text-foreground">
                  {row.name.substring(0, 2)}
               </div>

               <div>
                  <p className="font-bold text-foreground flex items-center gap-2 text-base">
                    {row.name}
                    {row.rank === 1 && !compact && <span className="chip-neutral px-2 py-0.5 text-[10px]">КАНДИДАТ НА ПОВЫШЕНИЕ</span>}
                  </p>
                  {!compact && (
                    <div className="flex items-center gap-3 mt-1">
                      <LevelBadge level={toLevelTier(row.level)} />
                      {row.completedModules > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" /> {row.completedModules} модулей
                        </span>
                      )}
                      {row.certificates > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" /> {row.certificates} серт.
                        </span>
                      )}
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-4 sm:ml-auto">
               {row.streak > 0 && !compact && (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-bold">{row.streak}</span>
                 </div>
               )}
               
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
                  <span className="text-sm font-bold text-indigo-400">{row.xp}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">XP</span>
               </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  const currentRows = grouped?.[activeLeague] || [];

  return (
    <div className="space-y-6">
      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 surface-elevated rounded-2xl w-fit">
        {LEAGUES.map((league) => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeLeague === league.id
                ? "text-foreground"
                : "text-muted-foreground hover:bg-card/50"
            }`}
          >
            {activeLeague === league.id && (
              <motion.div
                layoutId="leagueTab"
                className="absolute inset-0 bg-card rounded-xl border border-border shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 450, damping: 40 }}
              />
            )}
            <span className={`relative z-10 ${activeLeague === league.id ? league.color : ""}`}>
              {league.icon}
            </span>
            <span className="relative z-10">{league.label}</span>
          </button>
        ))}
      </div>

      {/* Roster */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLeague}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {currentRows.length === 0 ? (
             <EmptyState
               icon={Trophy}
               title={`${LEAGUES.find(l => l.id === activeLeague)?.label} лига пуста`}
               description="В этой лиге пока никого нет. Стань первым, набирая XP и удерживая Огненную Серию!"
             />
          ) : (
            currentRows.map((row) => (
              <article
                key={row.userId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 surface-elevated rounded-2xl border border-border/50 hover:border-border transition-colors group"
              >
                <div className="flex items-center gap-4">
                   <div className="w-8 shrink-0 flex justify-center">
                     {rankIcon(row.rank)}
                   </div>
                   
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 border border-border/50 shrink-0 text-base font-bold uppercase text-foreground">
                      {row.name.substring(0, 2)}
                   </div>

                   <div>
                      <p className="font-bold text-foreground flex items-center gap-2 text-base">
                        {row.name}
                        {row.rank === 1 && <span className="chip-neutral px-2 py-0.5 text-[10px]">КАНДИДАТ НА ПОВЫШЕНИЕ</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <LevelBadge level={toLevelTier(row.level)} />
                        {row.completedModules > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" /> {row.completedModules} модулей
                          </span>
                        )}
                        {row.certificates > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3" /> {row.certificates} серт.
                          </span>
                        )}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 sm:ml-auto">
                   {/* Streak Metric */}
                   {row.streak > 0 && (
                     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-bold">{row.streak}</span>
                     </div>
                   )}
                   
                   {/* XP Metric */}
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
                      <span className="text-sm font-bold text-indigo-400">{row.xp}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">XP</span>
                   </div>
                </div>

              </article>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
