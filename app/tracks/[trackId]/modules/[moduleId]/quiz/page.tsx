import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { authOptions } from "@/lib/auth";
import { generateAiQuizQuestions } from "@/lib/ai/quiz-generator";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { findRuntimeModuleProgressById } from "@/lib/learning/progress";
import { resolveLearningUser } from "@/lib/learning-user";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";

type QuizPageProps = {
  params: {
    trackId: string;
    moduleId: string;
  };
};

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const runtimeTrack = await resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: true });
  const moduleItem = runtimeTrack?.modules.find((m) => m.id === params.moduleId);
  if (!runtimeTrack || !moduleItem) return {};
  return {
    title: `Quiz: ${moduleItem.title} — Levio`,
    description: `Test your knowledge of ${moduleItem.title} in the ${runtimeTrack.title} track.`,
    robots: { index: false },
  };
}

type QuizQuestionView = {
  id: string;
  text: string;
  type: "SINGLE" | "MULTI";
  options: Array<{ id: string; text: string }>;
  correctAnswer: string[];
};

export default async function QuizPage({ params }: QuizPageProps) {
  const [session, runtimeTrack, localeValue] = await Promise.all([
    getServerSession(authOptions),
    resolveRuntimeCourseBySlug(params.trackId, { includeCourseEntities: true }),
    getLocale(),
  ]);

  const track = runtimeTrack
    ? applyTrackContentOverrides(runtimeTrack, normalizeLearningLocale(localeValue))
    : null;

  if (!track) {
    notFound();
  }

  const moduleItem = track?.modules.find((moduleEntry) => moduleEntry.id === params.moduleId) ?? null;

  if (!moduleItem || !moduleItem.quiz) {
    notFound();
  }

  const user = await resolveLearningUser(session?.user?.email);
  const progress = user
    ? await findRuntimeModuleProgressById({
        userId: user.id,
        moduleId: moduleItem.id,
        source: track.source,
      })
    : null;

  const fallbackQuestions: QuizQuestionView[] = moduleItem.quiz.questions.map((question) => ({
    id: question.id,
    text: question.text,
    type: question.type === "MULTI" ? "MULTI" : "SINGLE",
    options: question.options,
    correctAnswer: question.correctAnswer,
  }));
  const normalizedLocale = normalizeLearningLocale(localeValue);
  const generatedQuiz = track.category === "QA"
    ? await generateAiQuizQuestions({
        trackTitle: track.title,
        moduleItem,
        locale: normalizedLocale,
        fallbackQuestions,
      })
    : { questions: fallbackQuestions, source: "fallback" as const };
  const questions = generatedQuiz.questions;
  const quizId = generatedQuiz.source === "ai" ? `${moduleItem.quiz.id}:ai` : moduleItem.quiz.id;
  const quizTitle = generatedQuiz.source === "ai" ? `${moduleItem.quiz.title} · AI` : moduleItem.quiz.title;

  const lessonContext = [
    moduleItem.title,
    track.title,
    ...moduleItem.lessons.slice(0, 2).map((lesson) => `${lesson.title}\n${lesson.body}`),
  ]
    .join("\n\n")
    .slice(0, 2000);

  return (
    <section className="surface-elevated space-y-6 p-4 text-foreground sm:p-6 lg:p-7">
      <header className="space-y-3 border-b border-border pb-5">
        <Breadcrumb
          items={[
            { label: track.title, href: `/tracks/${track.slug}` },
            { label: moduleItem.title, href: `/tracks/${track.slug}/modules/${moduleItem.id}` },
            { label: "Тест" },
          ]}
        />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Интерактивный тест</p>
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">{moduleItem.quiz.title}</h1>
        <p className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="break-words">Трек: {track.title}</span>
          <span className="hidden px-1 text-muted-foreground sm:inline">|</span>
          <span className="break-words">Модуль: {moduleItem.title}</span>
          <span className="hidden px-1 text-muted-foreground sm:inline">|</span>
          <span>Проходной балл: {moduleItem.quiz.passingScore}%</span>
        </p>
        {progress && progress.score !== null && (
          <p className="text-xs text-muted-foreground">
            Предыдущий результат: {progress.score}% {progress.status === "COMPLETED" ? "(модуль завершён)" : ""}
          </p>
        )}
      </header>

      <QuizPlayer
        trackSlug={track.slug}
        moduleId={moduleItem.id}
        quizId={quizId}
        canonicalQuizId={moduleItem.quiz.id}
        quizTitle={quizTitle}
        passingScore={moduleItem.quiz.passingScore}
        questions={questions}
        generatedByAi={generatedQuiz.source === "ai"}
        lessonContext={lessonContext}
      />

      <div className="border-t border-border pt-4">
        <Link
          href={`/tracks/${track.slug}/modules/${moduleItem.id}`}
          className="btn-secondary inline-flex w-full justify-center sm:w-auto"
        >
          К модулю
        </Link>
      </div>
    </section>
  );
}
