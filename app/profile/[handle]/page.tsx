import { getServerSession } from "next-auth";

import { PublicProfileView } from "@/components/saas/public-profile-view";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard/data";

type PublicProfilePageProps = {
  params: {
    handle: string;
  };
};

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
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
    handle: params.handle,
  };

  return (
    <section className="page-shell">
      <PublicProfileView profile={profile} />
    </section>
  );
}
