import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/ui/page-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitPeerReviewAction } from "../actions";
import { CriteriaSliders } from "./criteria-sliders";

export const metadata: Metadata = {
  title: "Write Review — SkillPath Academy",
  description: "Submit your peer review for a mission submission.",
};

interface ReviewPageProps {
  params: { submissionId: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) redirect("/login");

  const submission = await prisma.missionSubmission.findUnique({
    where: { id: params.submissionId },
    include: {
      mission: {
        select: {
          title: true,
          scenario: true,
          objective: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!submission) notFound();

  // Prevent reviewing your own submission
  if (submission.userId === currentUser.id) redirect("/peer-review");

  // Prevent double review
  const existingReview = await prisma.peerReview.findUnique({
    where: {
      submissionId_reviewerId: {
        submissionId: submission.id,
        reviewerId: currentUser.id,
      },
    },
  });
  if (existingReview) redirect("/peer-review?reviewed=1");

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Peer Review"
        title={submission.mission.title}
        description="Read the submission carefully and rate it on the three criteria below."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission content */}
        <div className="surface-panel p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Submission
          </h2>

          {submission.mission.objective && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Objective</p>
              <p className="text-sm text-foreground">{submission.mission.objective}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Answer</p>
            <div className="rounded-md bg-muted/40 border border-border p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {submission.answer}
            </div>
          </div>
        </div>

        {/* Review form */}
        <form action={submitPeerReviewAction} className="surface-panel p-6 flex flex-col gap-6">
          <input type="hidden" name="submissionId" value={submission.id} />

          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Your Evaluation
          </h2>

          <CriteriaSliders />

          {/* Feedback */}
          <div className="flex flex-col gap-2">
            <label htmlFor="feedback" className="text-sm font-medium text-foreground">
              Written Feedback <span className="text-destructive">*</span>
            </label>
            <textarea
              id="feedback"
              name="feedback"
              required
              minLength={50}
              rows={6}
              placeholder="Write at least 50 characters of constructive feedback. What did the author do well? What could be improved?"
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            <p className="text-xs text-muted-foreground">Minimum 50 characters required.</p>
          </div>

          <button
            type="submit"
            className="btn-primary inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium"
          >
            Submit Review
          </button>
        </form>
      </div>
    </section>
  );
}
