import "server-only";

import { callAnthropic } from "@/lib/ai/ai-service";
import type { RuntimeModule, RuntimeQuestion } from "@/lib/learning/content-types";

export type AiQuizQuestion = {
  id: string;
  text: string;
  type: "SINGLE" | "MULTI";
  options: Array<{ id: string; text: string }>;
  correctAnswer: string[];
};

export type AiQuizGenerationResult = {
  questions: AiQuizQuestion[];
  source: "ai" | "fallback";
};

type GenerateAiQuizInput = {
  trackTitle: string;
  moduleItem: RuntimeModule;
  locale: "ru" | "en";
  fallbackQuestions: AiQuizQuestion[];
};

type CachedAiQuizInput = Omit<GenerateAiQuizInput, "fallbackQuestions">;

const OPTION_IDS = ["a", "b", "c", "d"];
const quizCache = new Map<string, AiQuizGenerationResult>();

function fallbackQuizResult(fallbackQuestions: AiQuizQuestion[]) {
  return { questions: fallbackQuestions, source: "fallback" as const };
}

function buildQuizCacheKey({ trackTitle, moduleItem, locale }: CachedAiQuizInput) {
  return [
    "ai-quiz",
    locale,
    trackTitle,
    moduleItem.id,
    moduleItem.title,
    moduleItem.lessons.map((lesson) => `${lesson.id}:${lesson.title}`).join("|"),
  ].join(":");
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function safeParseJson(value: string): unknown {
  const stripped = stripCodeFence(value);
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      return JSON.parse(stripped.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function normalizeGeneratedQuestions(raw: unknown, moduleId: string): AiQuizQuestion[] {
  const questions = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw !== null && Array.isArray((raw as { questions?: unknown }).questions)
      ? (raw as { questions: unknown[] }).questions
      : [];

  return questions
    .slice(0, 6)
    .map((item, questionIndex) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const question = item as {
        text?: unknown;
        type?: unknown;
        options?: unknown;
        correctAnswer?: unknown;
      };
      const text = typeof question.text === "string" ? question.text.trim() : "";
      const type = String(question.type ?? "").toUpperCase().includes("MULTI") ? "MULTI" : "SINGLE";
      const rawOptions = Array.isArray(question.options) ? question.options : [];
      const options = rawOptions
        .slice(0, 4)
        .map((option, optionIndex) => {
          if (typeof option === "string") {
            return { id: OPTION_IDS[optionIndex] ?? `opt-${optionIndex + 1}`, text: option.trim() };
          }
          if (typeof option === "object" && option !== null) {
            const optionObject = option as { id?: unknown; text?: unknown };
            return {
              id: OPTION_IDS[optionIndex] ?? `opt-${optionIndex + 1}`,
              text: typeof optionObject.text === "string" ? optionObject.text.trim() : "",
            };
          }
          return null;
        })
        .filter((option): option is { id: string; text: string } => Boolean(option?.text));

      const optionIds = new Set(options.map((option) => option.id));
      const answerValues = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
      const correctAnswer = answerValues
        .map((answer) => normalizeGeneratedAnswer(answer, options))
        .filter((answer): answer is string => Boolean(answer && optionIds.has(answer)));

      if (!text || options.length < 3 || correctAnswer.length === 0) {
        return null;
      }

      return {
        id: `ai-${moduleId}-${questionIndex + 1}`,
        text,
        type,
        options,
        correctAnswer: type === "SINGLE" ? [correctAnswer[0]!] : Array.from(new Set(correctAnswer)).sort(),
      };
    })
    .filter((question): question is AiQuizQuestion => Boolean(question));
}

function normalizeGeneratedAnswer(answer: unknown, options: Array<{ id: string; text: string }>) {
  if (typeof answer === "number" && Number.isInteger(answer)) {
    return OPTION_IDS[answer] ?? OPTION_IDS[answer - 1] ?? null;
  }

  if (typeof answer !== "string") {
    return null;
  }

  const normalizedAnswer = answer.trim().toLowerCase();
  if (!normalizedAnswer) {
    return null;
  }

  if (OPTION_IDS.includes(normalizedAnswer)) {
    return normalizedAnswer;
  }

  const numericAnswer = Number.parseInt(normalizedAnswer, 10);
  if (Number.isInteger(numericAnswer)) {
    return OPTION_IDS[numericAnswer - 1] ?? OPTION_IDS[numericAnswer] ?? null;
  }

  const matchedOption = options.find((option) => option.text.trim().toLowerCase() === normalizedAnswer);
  return matchedOption?.id ?? null;
}

function compactQuestion(question: RuntimeQuestion) {
  return {
    text: question.text,
    type: question.type,
    options: question.options.map((option) => option.text),
  };
}

function moduleContext(moduleItem: RuntimeModule) {
  const content = moduleItem.content as {
    overview?: unknown;
    outcomes?: unknown;
    objectives?: unknown;
    whatYouWillLearn?: unknown;
    finalChallenge?: unknown;
    realWorldExample?: unknown;
  };

  return [
    `Module title: ${moduleItem.title}`,
    `Module description: ${moduleItem.description}`,
    typeof content.overview === "string" ? `Overview: ${content.overview}` : "",
    Array.isArray(content.outcomes) ? `Outcomes: ${content.outcomes.join("; ")}` : "",
    Array.isArray(content.objectives) ? `Objectives: ${content.objectives.join("; ")}` : "",
    Array.isArray(content.whatYouWillLearn) ? `Skills: ${content.whatYouWillLearn.join("; ")}` : "",
    typeof content.realWorldExample === "string" ? `Real world example: ${content.realWorldExample}` : "",
    typeof content.finalChallenge === "string" ? `Final challenge: ${content.finalChallenge}` : "",
    ...moduleItem.lessons.slice(0, 3).map((lesson) => `Lesson: ${lesson.title}\n${lesson.body.slice(0, 900)}`),
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 6500);
}

export async function generateAiQuizQuestions({
  trackTitle,
  moduleItem,
  locale,
  fallbackQuestions,
}: GenerateAiQuizInput): Promise<AiQuizGenerationResult> {
  const cacheKey = buildQuizCacheKey({ trackTitle, moduleItem, locale });
  const cached = quizCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const systemPrompt = [
    "You are Levio's senior QA education designer.",
    "Generate practical beginner-friendly quiz questions for an LMS.",
    "Return only valid JSON. No markdown, no comments.",
    "Each question must test applied understanding, not memorization.",
    "Use realistic QA work situations and concise wording.",
  ].join("\n");

  const userPrompt = [
    `Language: ${locale === "ru" ? "Russian" : "English"}`,
    `Track: ${trackTitle}`,
    `Question count: 5`,
    "JSON schema:",
    `{"questions":[{"text":"...","type":"SINGLE|MULTI","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswer":["a"]}]}`,
    "Rules:",
    "- use exactly four options per question",
    "- use option ids a,b,c,d",
    "- include 4 SINGLE and 1 MULTI question",
    "- for MULTI, 2 or 3 answers may be correct",
    "- wrong options must be plausible beginner mistakes",
    "- align questions with the module scenario and final artifact",
    "- do not copy the reference questions verbatim",
    `Module context:\n${moduleContext(moduleItem)}`,
    `Reference existing quiz style:\n${JSON.stringify(moduleItem.quiz?.questions.slice(0, 5).map(compactQuestion) ?? [])}`,
  ].join("\n\n");

  const result = await callAnthropic({
    systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.45,
    maxTokens: 2200,
  });

  if (!result.ok) {
    const fallbackResult = fallbackQuizResult(fallbackQuestions);
    quizCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  const parsed = safeParseJson(result.data);
  const generatedQuestions = normalizeGeneratedQuestions(parsed, moduleItem.id);

  if (generatedQuestions.length < 5) {
    const fallbackResult = fallbackQuizResult(fallbackQuestions);
    quizCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  const generatedResult = { questions: generatedQuestions.slice(0, 5), source: "ai" as const };
  quizCache.set(cacheKey, generatedResult);
  return generatedResult;
}

export function getCachedAiQuizQuestions(input: CachedAiQuizInput) {
  const cached = quizCache.get(buildQuizCacheKey(input));
  return cached?.source === "ai" ? cached.questions : null;
}
