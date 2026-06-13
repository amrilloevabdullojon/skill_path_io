import { beforeEach, describe, expect, it, vi } from "vitest";

import { callAnthropic } from "@/lib/ai/ai-service";
import type { RuntimeModule } from "@/lib/learning/content-types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/ai-service", () => ({
  callAnthropic: vi.fn(),
}));

const fallbackQuestions = [
  {
    id: "fallback-1",
    text: "Что делает QA?",
    type: "SINGLE" as const,
    options: [
      { id: "a", text: "Снижает риски" },
      { id: "b", text: "Пишет только код" },
      { id: "c", text: "Делает только дизайн" },
      { id: "d", text: "Не участвует в релизе" },
    ],
    correctAnswer: ["a"],
  },
];

function buildModule(id: string): RuntimeModule {
  return {
    id,
    courseId: "track-1",
    order: 1,
    title: "Основы ручного тестирования",
    description: "Разбор роли QA через рабочий сценарий",
    estimatedDuration: 60,
    xpReward: 100,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    content: {
      overview: "QA проверяет продуктовые риски.",
      outcomes: ["Находить риск", "Писать evidence"],
      finalChallenge: "Собрать QA artifact",
    },
    lessons: [
      {
        id: `${id}-lesson-1`,
        moduleId: id,
        order: 1,
        title: "Чем занимается Manual QA",
        description: "",
        body: "Сцена: пользователь регистрируется и не получает подтверждение.",
        lessonType: "TEXT",
        estimatedDuration: 20,
        status: "PUBLISHED",
        blocks: [],
      },
    ],
    quiz: {
      id: `${id}-quiz`,
      moduleId: id,
      title: "Quiz",
      description: "",
      passingScore: 70,
      status: "PUBLISHED",
      questions: [],
    },
    missions: [],
    simulations: [],
  };
}

function aiPayload() {
  return JSON.stringify({
    questions: Array.from({ length: 5 }, (_, index) => ({
      text: `Практический вопрос ${index + 1}`,
      type: index === 4 ? "MULTI" : "SINGLE",
      options: [
        { id: "a", text: "Верное действие QA" },
        { id: "b", text: "Поспешный вывод без evidence" },
        { id: "c", text: "Игнорировать риск" },
        { id: "d", text: "Проверять только happy path" },
      ],
      correctAnswer: index === 4 ? ["a", "b"] : ["a"],
    })),
  });
}

describe("generateAiQuizQuestions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(callAnthropic).mockReset();
  });

  it("returns AI questions from a valid structured response", async () => {
    vi.mocked(callAnthropic).mockResolvedValue({ ok: true, data: aiPayload() });
    const { generateAiQuizQuestions } = await import("@/lib/ai/quiz-generator");

    const result = await generateAiQuizQuestions({
      trackTitle: "QA Engineer",
      moduleItem: buildModule("ai-module-valid"),
      locale: "ru",
      fallbackQuestions,
    });

    expect(result.source).toBe("ai");
    expect(result.questions).toHaveLength(5);
    expect(result.questions[0]?.id).toBe("ai-ai-module-valid-1");
  });

  it("falls back when AI returns invalid quiz JSON", async () => {
    vi.mocked(callAnthropic).mockResolvedValue({ ok: true, data: '{"questions":[]}' });
    const { generateAiQuizQuestions } = await import("@/lib/ai/quiz-generator");

    const result = await generateAiQuizQuestions({
      trackTitle: "QA Engineer",
      moduleItem: buildModule("ai-module-invalid"),
      locale: "ru",
      fallbackQuestions,
    });

    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("invalid_ai_response");
    expect(result.questions).toBe(fallbackQuestions);
  });

  it("does not cache temporary AI failures as permanent fallback", async () => {
    vi.mocked(callAnthropic)
      .mockResolvedValueOnce({ ok: false, status: 503, error: "unavailable" })
      .mockResolvedValueOnce({ ok: true, data: aiPayload() });
    const { generateAiQuizQuestions } = await import("@/lib/ai/quiz-generator");
    const moduleItem = buildModule("ai-module-retry");

    const first = await generateAiQuizQuestions({
      trackTitle: "QA Engineer",
      moduleItem,
      locale: "ru",
      fallbackQuestions,
    });
    const second = await generateAiQuizQuestions({
      trackTitle: "QA Engineer",
      moduleItem,
      locale: "ru",
      fallbackQuestions,
    });

    expect(first.source).toBe("fallback");
    expect(first.fallbackReason).toBe("ai_unavailable");
    expect(second.source).toBe("ai");
    expect(callAnthropic).toHaveBeenCalledTimes(2);
  });
});
