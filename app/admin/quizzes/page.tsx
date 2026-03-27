import type { Metadata } from "next";
import Link from "next/link";

import { DeleteQuizButton } from "@/components/admin/quizzes/delete-quiz-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Quizzes — Admin",
  robots: { index: false },
};

const TRACK_BADGE: Record<string, string> = {
  QA: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  BA: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  DA: "border-violet-500/30 bg-violet-500/10 text-violet-400",
};

export default async function AdminQuizzesPage() {
  await requireAdminPermission("courses.read");

  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ module: { track: { title: "asc" } } }, { module: { order: "asc" } }],
    select: {
      id: true,
      title: true,
      passingScore: true,
      module: {
        select: {
          id: true,
          title: true,
          track: { select: { title: true, category: true } },
        },
      },
      _count: { select: { questions: true } },
    },
  });

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Quizzes"
        description="Manage quizzes and their questions. Each module can have one quiz."
        actionLabel="New quiz"
        actionHref="/admin/quizzes/new"
      />

      <section className="surface-elevated space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
        </p>

        {quizzes.length === 0 ? (
          <EmptyState
            title="No quizzes found"
            description="No quizzes have been created yet."
            actionLabel="New quiz"
            actionHref="/admin/quizzes/new"
            size="sm"
          />
        ) : (
          <div className="table-shell">
            <table className="table-base min-w-[760px]">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3 text-left">Track</th>
                  <th className="px-3 py-3 text-left">Module</th>
                  <th className="px-3 py-3 text-left">Quiz title</th>
                  <th className="px-3 py-3 text-left">Pass %</th>
                  <th className="px-3 py-3 text-left">Questions</th>
                  <th className="px-3 py-3 text-left">Edit</th>
                  <th className="px-3 py-3 text-left">Del</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="table-row">
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TRACK_BADGE[quiz.module.track.category] ?? "border-border bg-card text-muted-foreground"}`}
                      >
                        {quiz.module.track.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">
                      {quiz.module.title}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-foreground">
                      {quiz.title}
                    </td>
                    <td className="px-3 py-2 font-mono text-sm">
                      {quiz.passingScore}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-sm font-medium ${quiz._count.questions === 0 ? "text-rose-400" : "text-foreground"}`}
                      >
                        {quiz._count.questions}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/quizzes/${quiz.id}`}
                        className="btn-secondary px-2.5 py-1 text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
