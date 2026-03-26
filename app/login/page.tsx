import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { EntryExperience } from "@/components/auth/entry-experience";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In — SkillPath Academy",
  description: "Sign in to your SkillPath Academy account to continue learning.",
  robots: { index: false },
};
import { getDashboardData } from "@/lib/dashboard/data";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if ((role === "ADMIN" || role === "STUDENT") && session?.user) {
    const data = await getDashboardData({
      preferredEmail: session?.user?.email,
      sessionRole: role,
    });

    return (
      <section className="page-shell">
        <EntryExperience
          mode="member"
          member={{
            name: session.user.name ?? "SkillPath User",
            role,
            totalXp: data?.hero.totalXp ?? 0,
            overallProgress: data?.hero.overallProgress ?? 0,
            primaryTrackTitle: data?.hero.primaryTrackTitle ?? "Track",
            nextMissionTitle: data?.missionPreview[0]?.title ?? null,
            continueHref: role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
            roadmapHref: data?.hero.roadmapHref ?? "/career",
            mentorHref: data?.hero.mentorHref ?? "/dashboard",
          }}
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <EntryExperience mode="guest" />
    </section>
  );
}

