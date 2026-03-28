import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Peer Review — SkillPath Academy",
  description: "Review mission submissions from other learners.",
};

interface PeerReviewPageProps {
  searchParams: { reviewed?: string };
}

export default async function PeerReviewPage({ searchParams }: PeerReviewPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) redirect("/login");

  const submissions = await prisma.missionSubmission.findMany({
    where: {
      status: "SUBMITTED",
      userId: { not: currentUser.id },
      peerReviews: {
        none: {
          reviewerId: currentUser.id,
        },
      },
    },
    include: {
      mission: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 20,
  });

  const reviewed = searchParams.reviewed === "1";

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Community"
        title="Peer Review Queue"
        description="Help your peers grow by reviewing their mission submissions. Your feedback matters."
      />

      {reviewed && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Your review was submitted successfully. Thank you!
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="surface-panel p-8 text-center">
          <p className="text-muted-foreground">
            No submissions available for review right now. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <article key={submission.id} className="surface-panel surface-panel-hover p-5 flex flex-col gap-3">
              <div>
                <p className="chip-neutral inline-flex px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  Mission
                </p>
                <h2 className="mt-3 text-base font-semibold text-foreground line-clamp-2">
                  {submission.mission.title}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted{" "}
                {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <Link
                href={`/peer-review/${submission.id}`}
                className="btn-primary mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
              >
                Start Review
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
