import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionType } from "@prisma/client";

import { updateQuizAction } from "@/app/admin/actions";
import { DeleteQuizButton } from "@/components/admin/quizzes/delete-quiz-button";
import { DeleteQuestionButton } from "@/components/admin/quizzes/delete-question-button";
import { QuestionForm } from "@/components/admin/quizzes/question-form";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getQuizDetail } from "@/lib/admin/quizzes/queries";

export const metadata: Metadata = {
  title: "Edit Quiz — Admin",
  robots: { index: false },
};

const TYPE_BADGE: Record<QuestionType, string> = {
  SINGLE: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  MULTI: "border-violet-500/30 bg-violet-500/10 text-violet-400",
};

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  await requireAdminPermission("courses.write");

  const quiz = await getQuizDetail(params.id);

  if (!quiz) notFound();

  return (
    <section className="page-shell">
      <PageHeader
        kicker="Content"
        title="Edit Quiz"
        description={quiz.title}
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ── Left: quiz settings ─────────────────────────────────── */}
        <aside className="space-y-4">
          <section className="surface-elevated p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quiz settings
            </h2>
            <form action={updateQuizAction} className="space-y-4">
              <input type="hidden" name="quizId" value={quiz.id} />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Title *</label>
                <input
                  name="title"
                  required
                  maxLength={200}
                  defaultValue={quiz.title}
                  className="input-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Passing score %</label>
                <input
                  name="passingScore"
                  type="number"
                  required
                  min={0}
                  max={100}
                  defaultValue={quiz.passingScore}
                  className="input-base"
                />
              </div>

              <SaveRowButton />
            </form>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Info
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Module</dt>
                <dd className="font-medium text-foreground">{quiz.module.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Track</dt>
                <dd className="text-foreground">{quiz.module.track.title}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Questions</dt>
                <dd className="font-mono text-foreground">{quiz.questions.length}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/admin/modules/${quiz.module.id}`}
                className="btn-secondary justify-start text-xs"
              >
                Open module →
              </Link>
              <Link href="/admin/quizzes" className="btn-secondary justify-start text-xs">
                All quizzes →
              </Link>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
            </div>
          </section>
        </aside>

        {/* ── Right: questions ────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Questions list */}
          <section className="surface-elevated p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Questions ({quiz.questions.length})
            </h2>

            {quiz.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions yet. Add the first one below.
              </p>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((q, index) => {
                  const options = q.options as string[];
                  const correctAnswer = q.correctAnswer as string[];

                  return (
                    <div
                      key={q.id}
                      className="surface-panel rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 rounded bg-card px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                          <p className="text-sm text-foreground">{q.text}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[q.type]}`}
                          >
                            {q.type}
                          </span>
                          <DeleteQuestionButton
                            questionId={q.id}
                            questionText={q.text}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <ul className="space-y-1 pl-7">
                        {options.map((opt, oi) => {
                          const isCorrect = correctAnswer.includes(opt);
                          return (
                            <li
                              key={oi}
                              className={`flex items-center gap-2 text-xs ${isCorrect ? "text-emerald-400" : "text-muted-foreground"}`}
                            >
                              <span
                                className={`h-4 w-4 shrink-0 rounded border text-center leading-4 text-[10px] font-bold ${
                                  isCorrect
                                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                                    : "border-border bg-card"
                                }`}
                              >
                                {isCorrect ? "✓" : String.fromCharCode(65 + oi)}
                              </span>
                              {opt}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add question */}
          <section className="surface-elevated p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Add question
            </h2>
            <QuestionForm quizId={quiz.id} />
          </section>
        </div>
      </div>
    </section>
  );
}
