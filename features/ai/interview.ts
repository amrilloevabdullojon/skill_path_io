import { TrackCategory } from "@prisma/client";

import { requestAiCompletion } from "@/lib/ai/client";

export type InterviewTrack = TrackCategory;

export type InterviewQuestion = {
  id: string;
  text: string;
  expectedFocus: string;
};

export type InterviewAnswer = {
  questionId: string;
  answer: string;
};

export type InterviewEvaluation = {
  score: number;
  level: "Junior" | "Junior+" | "Middle";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
};

const QUESTION_BANK: Record<InterviewTrack, InterviewQuestion[]> = {
  QA: [
    { id: "qa-1", text: "Что такое test case и чем он отличается от checklist?", expectedFocus: "структура и назначение" },
    { id: "qa-2", text: "Как подойти к тестированию API?", expectedFocus: "позитив/негатив, статусы, данные" },
    { id: "qa-3", text: "Какие поля обязательно должны быть в bug report?", expectedFocus: "severity, steps, expected/actual" },
    { id: "qa-4", text: "Что такое регрессионное тестирование?", expectedFocus: "контроль критичных сценариев после изменений" },
  ],
  BA: [
    { id: "ba-1", text: "Что такое user story и зачем она нужна?", expectedFocus: "роль, цель, ценность" },
    { id: "ba-2", text: "Как формулировать acceptance criteria?", expectedFocus: "конкретность и проверяемость" },
    { id: "ba-3", text: "Как работать с конфликтующими требованиями?", expectedFocus: "приоритизация и компромиссы" },
    { id: "ba-4", text: "Что важно уточнить на discovery этапе?", expectedFocus: "ограничения, цели, риски" },
  ],
  DA: [
    { id: "da-1", text: "Что такое SQL JOIN и когда используешь LEFT JOIN?", expectedFocus: "объединение данных и null-строки" },
    { id: "da-2", text: "Как объяснить разницу между метрикой и KPI?", expectedFocus: "цель бизнеса и измерение" },
    { id: "da-3", text: "Как проверить качество данных перед анализом?", expectedFocus: "пропуски, дубликаты, аномалии" },
    { id: "da-4", text: "Как бы ты построил воронку в продуктовой аналитике?", expectedFocus: "шаги, конверсия, узкие места" },
  ],
};

export function getInterviewQuestions(track: InterviewTrack, count = 4) {
  return QUESTION_BANK[track].slice(0, count);
}

function countStrongAnswers(answers: InterviewAnswer[]) {
  return answers.reduce((sum, item) => {
    const words = item.answer.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 20) {
      return sum + 1;
    }
    if (words.length >= 10) {
      return sum + 0.5;
    }
    return sum;
  }, 0);
}

function localEvaluateInterview(track: InterviewTrack, answers: InterviewAnswer[]): InterviewEvaluation {
  const strongAnswerScore = countStrongAnswers(answers);
  const score = Math.round(Math.min((strongAnswerScore / Math.max(answers.length, 1)) * 100, 100));

  const level: InterviewEvaluation["level"] =
    score >= 75 ? "Middle" : score >= 55 ? "Junior+" : "Junior";

  return {
    score,
    level,
    strengths: [
      "Умение давать структурированные ответы.",
      `Хорошее понимание базовых тем направления ${track}.`,
    ],
    weaknesses: [
      "Не везде хватает конкретных примеров из практики.",
      "Некоторые ответы можно усилить метриками или критериями качества.",
    ],
    recommendations: [
      "Потренируйте STAR-формат ответов (Situation, Task, Action, Result).",
      "Добавьте в ответы 1 практический кейс на каждый ключевой вопрос.",
      "Повторите терминологию и пограничные сценарии интервью.",
    ],
    summary: "База сформирована, следующий шаг - сделать ответы более конкретными и доказательными.",
  };
}

function parseEvaluation(text: string): InterviewEvaluation | null {
  try {
    const value = JSON.parse(text) as Partial<InterviewEvaluation>;
    if (typeof value.score !== "number" || typeof value.summary !== "string") {
      return null;
    }

    return {
      score: Math.max(0, Math.min(Math.round(value.score), 100)),
      level:
        value.level === "Middle" || value.level === "Junior+" || value.level === "Junior"
          ? value.level
          : "Junior",
      strengths: Array.isArray(value.strengths)
        ? value.strengths.filter((item): item is string => typeof item === "string").slice(0, 4)
        : [],
      weaknesses: Array.isArray(value.weaknesses)
        ? value.weaknesses.filter((item): item is string => typeof item === "string").slice(0, 4)
        : [],
      recommendations: Array.isArray(value.recommendations)
        ? value.recommendations.filter((item): item is string => typeof item === "string").slice(0, 4)
        : [],
      summary: value.summary,
    };
  } catch {
    return null;
  }
}

export async function evaluateInterview(track: InterviewTrack, answers: InterviewAnswer[]) {
  const fallback = localEvaluateInterview(track, answers);

  const systemPrompt =
    "Ты интервьюер SkillPath Academy. Оцени ответы студента и верни только JSON без markdown.";
  const userPrompt = [
    "Формат JSON:",
    '{"score":0-100,"level":"Junior|Junior+|Middle","strengths":["..."],"weaknesses":["..."],"recommendations":["..."],"summary":"..."}',
    `Направление: ${track}`,
    ...answers.map((item, index) => `Q${index + 1}: ${item.answer}`),
  ].join("\n");

  const raw = await requestAiCompletion({
    systemPrompt,
    userPrompt,
    fallback: JSON.stringify(fallback),
    temperature: 0.35,
    maxTokens: 700,
  });

  return parseEvaluation(raw) ?? fallback;
}
