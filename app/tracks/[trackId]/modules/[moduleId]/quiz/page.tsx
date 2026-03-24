import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { QuizPlayer } from "@/components/quiz/quiz-player";
import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";
import { applyTrackContentOverrides, normalizeLearningLocale } from "@/lib/tracks/content-overrides";

type QuizPageProps = {
  params: {
    trackId: string;
    moduleId: string;
  };
};

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
    ? await prisma.userProgress.findUnique({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId: moduleItem.id,
          },
        },
      })
    : null;

  const questions: QuizQuestionView[] = moduleItem.quiz.questions.map((question) => ({
    id: question.id,
    text: question.text,
    type: question.type === "MULTI" ? "MULTI" : "SINGLE",
    options: question.options,
    correctAnswer: question.correctAnswer,
  }));

  const lessonContext = [
    moduleItem.title,
    track.title,
    ...moduleItem.lessons.slice(0, 2).map((lesson) => `${lesson.title}\n${lesson.body}`),
  ]
    .join("\n\n")
    .slice(0, 2000);

  return (
    <section className="surface-elevated space-y-6 p-4 text-slate-100 sm:p-6 lg:p-7">
      <header className="space-y-3 border-b border-slate-800 pb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interactive quiz</p>
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">{moduleItem.quiz.title}</h1>
        <p className="flex flex-col gap-1 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <span className="break-words">Track: {track.title}</span>
          <span className="hidden px-1 text-slate-500 sm:inline">|</span>
          <span className="break-words">Module: {moduleItem.title}</span>
          <span className="hidden px-1 text-slate-500 sm:inline">|</span>
          <span>Passing score: {moduleItem.quiz.passingScore}%</span>
        </p>
        {progress && progress.score !== null && (
          <p className="text-xs text-slate-400">
            Previous score: {progress.score}% {progress.status === "COMPLETED" ? "(module completed)" : ""}
          </p>
        )}
      </header>

      <QuizPlayer
        trackSlug={track.slug}
        moduleId={moduleItem.id}
        quizId={moduleItem.quiz.id}
        quizTitle={moduleItem.quiz.title}
        passingScore={moduleItem.quiz.passingScore}
        questions={questions}
        lessonContext={lessonContext}
      />

      <div className="border-t border-slate-800 pt-4">
        <Link
          href={`/tracks/${track.slug}/modules/${moduleItem.id}`}
          className="btn-secondary inline-flex w-full justify-center sm:w-auto"
        >
          Back to module
        </Link>
      </div>
    </section>
  );
}
