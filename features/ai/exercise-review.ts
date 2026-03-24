import { requestAiCompletion } from "@/lib/ai/client";

export type ExerciseType = "BUG_REPORT" | "USER_STORY" | "SQL_ANALYSIS" | "ANALYTICS_TASK";

export type ExerciseReviewInput = {
  exerciseType: ExerciseType;
  submission: string;
  context?: string;
};

export type ExerciseReviewResult = {
  score: number;
  accuracy: number;
  completeness: number;
  logic: number;
  feedback: string[];
  nextSteps: string[];
};

function localExerciseReview(input: ExerciseReviewInput): ExerciseReviewResult {
  const words = input.submission.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.min(100, Math.round(words * 2.2));
  const completeness = Math.min(100, base);
  const accuracy = Math.max(40, Math.min(100, Math.round(base * 0.9)));
  const logic = Math.max(45, Math.min(100, Math.round(base * 0.85)));
  const score = Math.round((accuracy + completeness + logic) / 3);

  return {
    score,
    accuracy,
    completeness,
    logic,
    feedback: [
      "Ответ имеет базовую структуру и понятную логику.",
      "Добавьте больше конкретики: критерии, ограничения, проверяемые пункты.",
      "Укажите один пример из реального сценария.",
    ],
    nextSteps: [
      "Сверьтесь с чеклистом качества перед отправкой.",
      "Сделайте краткую self-review версию с доработками.",
    ],
  };
}

function parseReview(text: string): ExerciseReviewResult | null {
  try {
    const parsed = JSON.parse(text) as Partial<ExerciseReviewResult>;
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.accuracy !== "number" ||
      typeof parsed.completeness !== "number" ||
      typeof parsed.logic !== "number"
    ) {
      return null;
    }

    return {
      score: Math.max(0, Math.min(Math.round(parsed.score), 100)),
      accuracy: Math.max(0, Math.min(Math.round(parsed.accuracy), 100)),
      completeness: Math.max(0, Math.min(Math.round(parsed.completeness), 100)),
      logic: Math.max(0, Math.min(Math.round(parsed.logic), 100)),
      feedback: Array.isArray(parsed.feedback)
        ? parsed.feedback.filter((item): item is string => typeof item === "string").slice(0, 4)
        : [],
      nextSteps: Array.isArray(parsed.nextSteps)
        ? parsed.nextSteps.filter((item): item is string => typeof item === "string").slice(0, 4)
        : [],
    };
  } catch {
    return null;
  }
}

export async function generateExerciseReview(input: ExerciseReviewInput) {
  const fallback = localExerciseReview(input);

  const systemPrompt =
    "Ты старший ментор SkillPath Academy. Оцени практическую работу и верни только JSON без markdown.";
  const userPrompt = [
    "Формат JSON:",
    '{"score":0-100,"accuracy":0-100,"completeness":0-100,"logic":0-100,"feedback":["..."],"nextSteps":["..."]}',
    `Тип задания: ${input.exerciseType}`,
    `Решение студента: ${input.submission}`,
    `Контекст: ${input.context ?? "нет"}`,
  ].join("\n");

  const raw = await requestAiCompletion({
    systemPrompt,
    userPrompt,
    fallback: JSON.stringify(fallback),
    temperature: 0.35,
    maxTokens: 700,
  });

  return parseReview(raw) ?? fallback;
}
