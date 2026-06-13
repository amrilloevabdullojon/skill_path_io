import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { QuizMistakesReview, type QuizMistakeItem } from "@/components/review/quiz-mistakes-review";
import { SpeedReviewMode } from "@/components/review/speed-review-mode";
import { buildSpeedReviewCards, type ReviewCard } from "@/features/review/speed-review";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserBookmark, UserNote } from "@/types/personalization";

export const metadata: Metadata = {
  title: "Быстрая проверка",
  description: "Повторяйте сохраненные закладки и заметки в режиме быстрых флеш-карточек.",
  robots: { index: false },
};

function mapTrack(moduleRef: string): UserNote["track"] {
  const normalized = moduleRef.toLowerCase();
  if (normalized.includes("ba") || normalized.includes("business")) {
    return "BA";
  }
  if (normalized.includes("da") || normalized.includes("data") || normalized.includes("sql")) {
    return "DA";
  }
  return "QA";
}

function mapBookmarkType(value: string): UserBookmark["type"] {
  if (value === "module" || value === "quiz" || value === "mission") {
    return value;
  }
  return "lesson";
}

function parseAnswerIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseOptions(value: unknown): Array<{ id: string; text: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string") {
      return [{ id: item, text: item }];
    }
    if (item && typeof item === "object" && "id" in item && "text" in item) {
      const id = String(item.id);
      const text = String(item.text);
      return id && text ? [{ id, text }] : [];
    }
    return [];
  });
}

function answerLabels(answerIds: string[], options: Array<{ id: string; text: string }>): string[] {
  const optionLabelById = new Map(options.map((option) => [option.id, option.text]));
  return answerIds.map((id) => optionLabelById.get(id) ?? id);
}

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    : null;
  const [noteRows, bookmarkRows, mistakeRows] = user
    ? await Promise.all([
        prisma.userNote.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 80,
        }),
        prisma.userBookmark.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          take: 80,
        }),
        prisma.quizQuestionResult.findMany({
          where: {
            attempt: { userId: user.id },
          },
          orderBy: { createdAt: "desc" },
          take: 300,
          select: {
            id: true,
            questionId: true,
            questionText: true,
            isCorrect: true,
            options: true,
            selectedAnswerIds: true,
            correctAnswerIds: true,
            attempt: {
              select: {
                trackTitle: true,
                trackSlug: true,
                moduleId: true,
                moduleTitle: true,
                quizTitle: true,
                submittedAt: true,
              },
            },
          },
        }),
      ])
    : [[], [], []];

  const notes: UserNote[] = noteRows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    track: mapTrack(row.moduleRef),
    lessonRef: row.lessonRef || row.moduleRef || "Общая заметка",
    createdAt: row.createdAt.toISOString(),
  }));
  const bookmarks: UserBookmark[] = bookmarkRows.map((row) => ({
    id: row.id,
    title: row.title,
    href: row.href,
    type: mapBookmarkType(row.type),
    tag: row.tag || "General",
  }));

  const unresolvedMistakeRows = [];
  const seenQuestionIds = new Set<string>();
  for (const row of mistakeRows) {
    if (seenQuestionIds.has(row.questionId)) {
      continue;
    }
    seenQuestionIds.add(row.questionId);
    if (!row.isCorrect) {
      unresolvedMistakeRows.push(row);
    }
  }

  const mistakes: QuizMistakeItem[] = unresolvedMistakeRows.map((row) => {
    const options = parseOptions(row.options);

    return {
      id: row.id,
      question: row.questionText,
      selectedAnswers: answerLabels(parseAnswerIds(row.selectedAnswerIds), options),
      correctAnswers: answerLabels(parseAnswerIds(row.correctAnswerIds), options),
      trackTitle: row.attempt.trackTitle,
      trackSlug: row.attempt.trackSlug,
      moduleId: row.attempt.moduleId,
      moduleTitle: row.attempt.moduleTitle,
      quizTitle: row.attempt.quizTitle,
      submittedAt: row.attempt.submittedAt,
    };
  });

  const mistakeCards: ReviewCard[] = mistakes.slice(0, 8).map((mistake) => ({
    id: `mistake-${mistake.id}`,
    title: `Ошибка: ${mistake.moduleTitle}`,
    type: "mistake",
    detail: mistake.question,
    answer: `Правильный ответ: ${
      mistake.correctAnswers.length > 0 ? mistake.correctAnswers.join(", ") : "ответ не указан"
    }`,
  }));
  const cards = buildSpeedReviewCards(notes, bookmarks, mistakeCards);

  return (
    <section className="page-shell space-y-8">
      <QuizMistakesReview mistakes={mistakes} />
      <SpeedReviewMode cards={cards} />
    </section>
  );
}
