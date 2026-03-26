import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { PageHeader } from "@/components/ui/page-header";
import { buildLeaderboard } from "@/features/gamification/leaderboard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Leaderboard — SkillPath Academy",
  description: "Top learners ranked by XP, completed modules, and certificates on SkillPath Academy.",
  openGraph: {
    title: "Learning Leaderboard — SkillPath Academy",
    description: "See who's leading the QA, BA, and DA learning tracks.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      progresses: {
        select: {
          status: true,
          score: true,
        },
      },
      _count: {
        select: {
          certificates: true,
        },
      },
    },
  });

  const rows = buildLeaderboard(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      progresses: user.progresses,
      certificates: user._count.certificates,
    })),
  );

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Leaderboard"
        title="Weekly XP Ranking"
        description="Competition based on XP, completed modules, and certificates."
      />

      <section className="surface-elevated p-5 sm:p-6">
        <LeaderboardTable rows={rows} />
      </section>
    </section>
  );
}

