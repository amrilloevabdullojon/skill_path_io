import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Inbox, Target, LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { SwipeDeck } from "@/components/peer-review/swipe-deck";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Peer Review",
  description: "Review mission submissions from other learners.",
};

interface PeerReviewPageProps {
  searchParams: Promise<{ reviewed?: string }>;
}

export default async function PeerReviewPage({ searchParams }: PeerReviewPageProps) {
  const resolvedSearchParams = await searchParams;
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

  const reviewed = resolvedSearchParams.reviewed === "1";

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
        <div className="surface-elevated rounded-2xl p-12 text-center flex flex-col items-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Очередь пуста</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Нет доступных работ для проверки прямо сейчас. Возвращайтесь позже или займитесь заданиями.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link href="/missions" className="btn-primary gap-2">
              <Target className="w-4 h-4" />
              Перейти к миссиям
            </Link>
            <Link href="/dashboard" className="btn-secondary gap-2">
              <LayoutDashboard className="w-4 h-4" />
              На дашборд
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              {submissions.length} {submissions.length === 1 ? "работа" : submissions.length < 5 ? "работы" : "работ"} в очереди
            </span>
            <span className="text-xs">· Свайп вправо — одобрить, влево — попросить доработать</span>
          </div>
          <div className="mt-4 flex justify-center">
            <SwipeDeck initialSubmissions={submissions} />
          </div>
        </>
      )}
    </section>
  );
}
