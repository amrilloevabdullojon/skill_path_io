import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateQuizAction } from "@/app/admin/actions";
import { DeleteQuizButton } from "@/components/admin/quizzes/delete-quiz-button";
import { QuestionEditorCard } from "@/components/admin/quizzes/question-editor-card";
import { QuestionForm } from "@/components/admin/quizzes/question-form";
import { SaveRowButton } from "@/components/admin/save-row-button";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getQuizDetail } from "@/lib/admin/quizzes/queries";

export const metadata: Metadata = {
  title: "Edit Quiz — Admin",
  robots: { index: false },
};

function normalizeQuestionOptions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((option, index) => {
      if (typeof option === "string") {
        return { id: `opt-${index + 1}`, text: option };
      }
      if (typeof option === "object" && option !== null) {
        const raw = option as Record<string, unknown>;
        const text = typeof raw.text === "string" ? raw.text : "";
        if (!text.trim()) return null;
        return {
          id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `opt-${index + 1}`,
          text,
        };
      }
      return null;
    })
    .filter((option): option is { id: string; text: string } => Boolean(option));
}

function normalizeCorrectAnswer(value: unknown, options: Array<{ id: string; text: string }>) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== "string") return null;
      return options.find((option) => option.id === item || option.text === item)?.id ?? null;
    })
    .filter((item): item is string => Boolean(item));
}

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await requireAdminPermission("courses.write");

  const quiz = await getQuizDetail(resolvedParams.id);

  if (!quiz) notFound();

  const normalizedQuestions = quiz.questions.map((question) => {
    const options = normalizeQuestionOptions(question.options);
    return {
      id: question.id,
      text: question.text,
      type: question.type,
      options,
      correctAnswer: normalizeCorrectAnswer(question.correctAnswer, options),
    };
  });
  const emptyQuestions = normalizedQuestions.filter((question) => question.options.length < 2 || question.correctAnswer.length === 0);

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
              <Link
                href={`/tracks/${quiz.module.track.slug}/modules/${quiz.module.id}/quiz`}
                className="btn-secondary justify-start text-xs"
              >
                Preview as student →
              </Link>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
            </div>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Readiness
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-semibold text-foreground">{normalizedQuestions.length}</span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Valid questions</span>
                <span className={emptyQuestions.length === 0 ? "font-semibold text-emerald-400" : "font-semibold text-amber-400"}>
                  {normalizedQuestions.length - emptyQuestions.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Student preview</span>
                <span className={emptyQuestions.length === 0 ? "font-semibold text-emerald-400" : "font-semibold text-rose-400"}>
                  {emptyQuestions.length === 0 ? "Ready" : "Needs fixes"}
                </span>
              </div>
            </div>
            {emptyQuestions.length > 0 ? (
              <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                Some questions have too few options or no correct answer. Fix them before students use this quiz.
              </p>
            ) : null}
          </section>
        </aside>

        {/* ── Right: questions ────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Questions list */}
          <section className="surface-elevated p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Questions ({quiz.questions.length})
            </h2>

            {normalizedQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions yet. Add the first one below.
              </p>
            ) : (
              <div className="space-y-3">
                {normalizedQuestions.map((q, index) => (
                  <QuestionEditorCard key={q.id} question={q} index={index} />
                ))}
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
