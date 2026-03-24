import { requestAiCompletion } from "@/lib/ai/client";

export type QuizReviewPayload = {
  question: string;
  options?: string[];
  userAnswers: string[];
  correctAnswers: string[];
  lessonContext: string;
};

export type QuizReviewResult = {
  explanation: string;
  tips: string[];
  recommendations: string[];
};

function localQuizReview(payload: QuizReviewPayload): QuizReviewResult {
  const explanation =
    payload.userAnswers.length === 0
      ? "Ответ не был выбран, поэтому система не смогла сопоставить его с ожидаемой логикой."
      : `Выбран ответ: ${payload.userAnswers.join(", ")}. Корректный ответ: ${payload.correctAnswers.join(", ")}. Ошибка связана с тем, что ключевое условие вопроса было интерпретировано неполно.`;

  return {
    explanation,
    tips: [
      "Сфокусируйтесь на формулировках с ограничениями: always, only, must.",
      "Перед выбором ответа проверьте, покрывает ли он весь сценарий, а не частный случай.",
      "Сравните правильный ответ с контекстом урока и выпишите 1-2 правила в заметки.",
    ],
    recommendations: [
      "Пересмотрите блок урока с определениями и примерами.",
      "Решите аналогичный вопрос повторно через 24 часа для закрепления.",
    ],
  };
}

function safeJsonParse(text: string): QuizReviewResult | null {
  try {
    const parsed = JSON.parse(text) as Partial<QuizReviewResult>;
    if (
      typeof parsed.explanation === "string" &&
      Array.isArray(parsed.tips) &&
      Array.isArray(parsed.recommendations)
    ) {
      return {
        explanation: parsed.explanation,
        tips: parsed.tips.filter((item): item is string => typeof item === "string").slice(0, 4),
        recommendations: parsed.recommendations
          .filter((item): item is string => typeof item === "string")
          .slice(0, 4),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateAiQuizReview(payload: QuizReviewPayload): Promise<QuizReviewResult> {
  const fallback = localQuizReview(payload);

  const systemPrompt =
    "Ты AI-наставник SkillPath Academy. Отвечай на русском языке. Верни только JSON без markdown.";
  const userPrompt = [
    "Сделай разбор ошибки в тесте и верни JSON формата:",
    '{"explanation":"...","tips":["..."],"recommendations":["..."]}',
    `Вопрос: ${payload.question}`,
    `Варианты: ${(payload.options ?? []).join("; ")}`,
    `Ответ студента: ${payload.userAnswers.join(", ") || "нет ответа"}`,
    `Правильный ответ: ${payload.correctAnswers.join(", ")}`,
    `Контекст урока: ${payload.lessonContext.slice(0, 2000)}`,
  ].join("\n");

  const raw = await requestAiCompletion({
    systemPrompt,
    userPrompt,
    fallback: JSON.stringify(fallback),
    temperature: 0.3,
    maxTokens: 500,
  });

  return safeJsonParse(raw) ?? fallback;
}
