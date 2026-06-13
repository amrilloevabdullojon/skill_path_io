import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { PublicProfileView } from "@/components/saas/public-profile-view";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";

type PublicProfilePageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `@${resolvedParams.handle}`,
    description: `Public learning profile on Levio. See skills, badges, and mission outcomes.`,
    openGraph: {
      title: `@${resolvedParams.handle} on Levio`,
      description: "Learner profile with skills, badges, and career readiness score.",
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const dashboard = await getDashboardData({
    preferredEmail: session?.user?.email,
    sessionRole: session?.user?.role,
  });

  if (!dashboard) {
    return (
      <section className="page-shell">
        <div className="surface-elevated p-6 text-sm text-muted-foreground">Profile not found.</div>
      </section>
    );
  }

  const profile = {
    ...dashboard.publicProfile,
    handle: resolvedParams.handle,
  };

  return (
    <section className="page-shell">
      <PublicProfileView profile={profile} />
    </section>
  );
}
