import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Trophy, Medal, Crown, Flame, Code2 } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Leaderboard — Levio",
  description: "Global ranking of top students by XP.",
};

// Next.js dynamic rendering 
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  
  // We can allow public leaderboard or limit to users. Let's limit to users to increase registration conversion.
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch users with their gamification data
  const usersRaw = await prisma.user.findMany({
    where: {
      // Ignore super admins from the learning leaderboard
      role: { not: "ADMIN" }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          progresses: { where: { status: "COMPLETED" } },
          peerReviewsGiven: true,
          certificates: true,
          courseCertificates: true,
        }
      }
    },
    take: 100 // We fetch 100, calculate XP in memory, and slice top 10
  });

  // Calculate XP
  const usersWithXp = usersRaw.map(u => {
    const xp = (u._count.progresses * 50) + 
               (u._count.peerReviewsGiven * 30) + 
               ((u._count.certificates + u._count.courseCertificates) * 500);
    return { ...u, xp };
  });

  // Sort descending
  const sorted = usersWithXp
    .filter(u => u.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  // Keep top 20 for display
  const leaderboard = sorted.slice(0, 20);

  // Find current user's rank if they're outside top 20
  const currentUserId = session.user.id;
  const currentUserGlobalRank = sorted.findIndex(u => u.id === currentUserId);
  const isCurrentUserInTop20 = leaderboard.some(u => u.id === currentUserId);
  const currentUserOutside = !isCurrentUserInTop20 && currentUserGlobalRank !== -1
    ? { ...sorted[currentUserGlobalRank], rank: currentUserGlobalRank + 1 }
    : null;

  // Calculate next milestone: how many XP to overtake the person above
  const currentUserXp = sorted.find(u => u.id === currentUserId)?.xp ?? 0;
  const userAboveIndex = currentUserGlobalRank > 0 ? currentUserGlobalRank - 1 : -1;
  const userAboveXp = userAboveIndex >= 0 ? sorted[userAboveIndex]?.xp ?? 0 : 0;
  const xpToNextRank = userAboveXp > 0 ? userAboveXp - currentUserXp + 1 : null;

  // Assign Ranks
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getRankStyle = (index: number) => {
    if (index === 0) return { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: Crown };
    if (index === 1) return { color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20", icon: Medal };
    if (index === 2) return { color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20", icon: Medal };
    return { color: "text-muted-foreground", bg: "bg-transparent", border: "border-transparent", icon: Trophy };
  };

  return (
    <section className="page-shell max-w-5xl mx-auto">
      <PageHeader
        kicker="Hall of Fame"
        title="Global Leaderboard"
        description="Rankings are based on Experience Points (XP) earned from completing modules, passing quizzes, and reviewing peer code."
      />

      {/* Milestone banner for current user */}
      {currentUserXp > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ваш результат: <span className="text-orange-400 font-mono">{currentUserXp.toLocaleString()} XP</span>
                {currentUserGlobalRank >= 0 && (
                  <span className="ml-2 text-muted-foreground font-normal">· #{currentUserGlobalRank + 1} в рейтинге</span>
                )}
              </p>
              {xpToNextRank && xpToNextRank > 0 ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  До следующей позиции: <span className="text-indigo-400 font-semibold">+{xpToNextRank.toLocaleString()} XP</span>
                </p>
              ) : currentUserGlobalRank === 0 ? (
                <p className="text-xs text-emerald-400 mt-0.5 font-semibold">Вы на первом месте!</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="surface-elevated rounded-2xl p-12 text-center mt-10">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Пока никто не набрал очки. Завершите модули и занимайте первое место!
          </p>
        </div>
      )}

      {/* Podium (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 items-end px-4">
        {[top3[1], top3[0], top3[2]].map((user, idx) => {
          if (!user) return null;
          // Actual rank mapping due to reordering for visual podium: index 0 -> Rank 2, index 1 -> Rank 1, index 2 -> Rank 3
          const rankNum = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const style = getRankStyle(rankNum - 1);
          const RankIcon = style.icon;
          const initial = (user.name || user.email).charAt(0).toUpperCase();
          const isWinner = rankNum === 1;

          return (
            <div key={user.id} className={`flex flex-col items-center p-6 rounded-2xl relative ${
              isWinner 
              ? "bg-gradient-to-t from-yellow-500/20 to-transparent border border-yellow-500/30 md:-translate-y-8" 
              : "surface-elevated"
            }`}>
              {/* Rank Badge */}
              <div className={`absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${style.bg} ${style.color} ${style.border}`}>
                #{rankNum}
              </div>
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl ${style.bg} ${style.color} ${style.border}`}>
                {initial}
              </div>
              
              <RankIcon className={`w-8 h-8 mb-2 ${style.color}`} />
              
              <h3 className="font-bold text-foreground text-center line-clamp-1">{user.name || user.email.split("@")[0]}</h3>
              {user.role === "MENTOR" && <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 mt-1">Mentor</span>}
              {user.role === "PRO_STUDENT" && <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mt-1">PRO</span>}
              
              <div className="mt-4 flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-mono font-bold text-orange-500">{user.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of the Leaderboard */}
      <div className="surface-elevated rounded-2xl overflow-hidden mt-8">
        <div className="table-shell border-none overflow-x-auto">
          <table className="table-base w-full min-w-[640px]">
            <thead className="table-head">
              <tr>
                <th scope="col" className="px-6 py-4 text-left w-20">Rank</th>
                <th scope="col" className="px-6 py-4 text-left">Learner</th>
                <th scope="col" className="px-6 py-4 text-center">Lessons</th>
                <th scope="col" className="px-6 py-4 text-center">Code Reviews</th>
                <th scope="col" className="px-6 py-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-border/50">
              {rest.map((user, idx) => {
                const rankNum = idx + 4;
                const initial = (user.name || user.email).charAt(0).toUpperCase();

                const isCurrentUser = session?.user?.id === user.id;

                return (
                  <tr key={user.id} className={`transition-colors hover:bg-muted/30 ${isCurrentUser ? "bg-sky-500/5" : ""}`}>
                    <td className="px-6 py-4 font-mono text-muted-foreground font-semibold">
                      #{rankNum}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground flex items-center gap-2">
                            {user.name || user.email.split("@")[0]}
                            {isCurrentUser && <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-sky-500/20 text-sky-400">YOU</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                      {user._count.progresses}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-sm text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                        <Code2 className="w-3 h-3" />
                        {user._count.peerReviewsGiven}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-foreground inline-flex items-center gap-1">
                        {user.xp.toLocaleString()} <span className="text-muted-foreground text-xs font-sans font-normal ml-1">XP</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current user rank if outside top 20 */}
      {currentUserOutside && (
        <div className="mt-4 surface-elevated rounded-2xl overflow-hidden">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest border-b border-border/50">
            Ваша позиция
          </div>
          <div className="overflow-x-auto">
            <table className="table-base w-full min-w-[640px]">
              <tbody>
                <tr className="bg-sky-500/5">
                  <td className="px-6 py-4 font-mono text-muted-foreground font-semibold w-20">
                    #{currentUserOutside.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {(currentUserOutside.name || currentUserOutside.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        {currentUserOutside.name || currentUserOutside.email.split("@")[0]}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-sky-500/20 text-sky-400">YOU</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {currentUserOutside._count.progresses}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-sm text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      <Code2 className="w-3 h-3" />
                      {currentUserOutside._count.peerReviewsGiven}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-foreground inline-flex items-center gap-1">
                      {currentUserOutside.xp.toLocaleString()} <span className="text-muted-foreground text-xs font-sans font-normal ml-1">XP</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
