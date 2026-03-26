import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { HiringMarketplaceHub } from "@/components/saas/hiring-marketplace-hub";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hiring Marketplace — SkillPath Academy",
  description: "Connect with companies hiring QA Engineers, Business Analysts, and Data Analysts.",
};
import { getDashboardData } from "@/lib/dashboard/data";
import { buildCandidateProfile, listMarketplaceRoles } from "@/lib/saas/marketplace";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Marketplace data unavailable"
          description="Open dashboard after user/content data is available."
          actionLabel="Open dashboard"
          actionHref="/dashboard"
        />
      </section>
    );
  }

  const roles = await listMarketplaceRoles();
  const candidateFromDashboard = buildCandidateProfile({
    userId: dashboard.user.id,
    name: dashboard.user.name,
    publicHandle: dashboard.publicProfile.handle,
    readinessScore: dashboard.publicProfile.readinessScore,
    skills: dashboard.publicProfile.skillRadar.map((item) => item.skill),
    badges: dashboard.publicProfile.badges.map((item) => item.label),
    portfolioHighlights: dashboard.publicProfile.portfolioHighlights,
  });
  const leaderboardCandidates = dashboard.leaderboard.rows
    .filter((row) => row.userId !== dashboard.user.id)
    .slice(0, 3)
    .map((row) =>
      buildCandidateProfile({
        userId: row.userId,
        name: row.name,
        publicHandle: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        readinessScore: Math.max(45, Math.min(96, row.xp / 12)),
        skills: dashboard.skillRadar.data.slice(0, 3).map((item) => item.skill),
        badges: dashboard.saasGamification.badges.slice(0, 3).map((item) => item.label),
        portfolioHighlights: [`${row.xp} XP earned`, `${row.level} progression`],
      }),
    );
  const candidates = [candidateFromDashboard, ...leaderboardCandidates];

  return (
    <section className="page-shell">
      <HiringMarketplaceHub
        roles={roles}
        candidates={candidates}
        topMatches={dashboard.jobMarketplace.topMatches}
        isLocked={!dashboard.subscription.gates.hiringMarketplace.allowed}
        upgradePlanId={dashboard.subscription.gates.hiringMarketplace.upgradePlanId}
      />
    </section>
  );
}

