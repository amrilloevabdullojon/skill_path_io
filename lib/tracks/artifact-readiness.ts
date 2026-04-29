export type ArtifactReadinessInput = {
  filledFields: number;
  totalFields: number;
  artifactHealth: number;
  hasReview: boolean;
  reviewScore?: number | null;
  portfolioSaved: boolean;
};

export type ArtifactReadinessItem = {
  id: "fields" | "health" | "review" | "portfolio";
  label: string;
  description: string;
  done: boolean;
};

export type ReviewGateInput = {
  contentLength: number;
  filledFields: number;
  minContentLength?: number;
  minFields?: number;
};

export type ReviewGate = {
  canReview: boolean;
  title: string;
  description: string;
};

export type ReviewActionPlanInput = {
  feedback?: string[];
  nextSteps?: string[];
};

export type ReviewActionItem = {
  id: string;
  source: "feedback" | "nextStep";
  text: string;
  target: "observation" | "risk" | "testIdea" | "evidence" | "decision";
  label: string;
};

export function buildArtifactReadinessChecklist(input: ArtifactReadinessInput): ArtifactReadinessItem[] {
  const reviewScore = input.reviewScore ?? 0;

  return [
    {
      id: "fields",
      label: "Заполнить 4 из 5 веток",
      description: `${Math.min(input.filledFields, input.totalFields)}/${input.totalFields} частей артефакта заполнены`,
      done: input.filledFields >= Math.min(4, input.totalFields),
    },
    {
      id: "health",
      label: "Довести здоровье до 70%",
      description: `Сейчас ${input.artifactHealth}%: усилите слабые поля перед review`,
      done: input.artifactHealth >= 70,
    },
    {
      id: "review",
      label: "Получить AI-review",
      description: input.hasReview ? `Оценка ${reviewScore || "-"} / 100` : "Запустите review после наполнения черновика",
      done: input.hasReview,
    },
    {
      id: "portfolio",
      label: "Сохранить в портфолио",
      description: input.portfolioSaved ? "Артефакт закреплён" : "Сохраните зрелый результат как доказательство навыка",
      done: input.portfolioSaved,
    },
  ];
}

export function artifactReadinessPercent(items: ArtifactReadinessItem[]) {
  if (items.length === 0) {
    return 0;
  }

  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

export function buildReviewGate(input: ReviewGateInput): ReviewGate {
  const minContentLength = input.minContentLength ?? 180;
  const minFields = input.minFields ?? 3;
  const missingFields = Math.max(0, minFields - input.filledFields);
  const missingContent = Math.max(0, minContentLength - input.contentLength);

  if (missingFields === 0 && missingContent === 0) {
    return {
      canReview: true,
      title: "AI-review доступен",
      description: "Черновик уже достаточно наполнен. Запускайте review и используйте feedback для доработки.",
    };
  }

  if (missingFields > 0 && missingContent > 0) {
    return {
      canReview: false,
      title: "AI-review пока закрыт",
      description: `Заполните ещё ${missingFields} пол. и добавьте примерно ${missingContent} символов содержательного контекста.`,
    };
  }

  if (missingFields > 0) {
    return {
      canReview: false,
      title: "Нужно больше веток",
      description: `Заполните ещё ${missingFields} пол., чтобы AI-review видел не отдельную заметку, а связанный артефакт.`,
    };
  }

  return {
    canReview: false,
    title: "Нужно больше контекста",
    description: `Добавьте примерно ${missingContent} символов: steps, expected/actual, риск или вывод.`,
  };
}

function reviewTargetFromText(text: string): ReviewActionItem["target"] {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("decision") ||
    normalized.includes("recommend") ||
    normalized.includes("retest") ||
    normalized.includes("вывод") ||
    normalized.includes("решен") ||
    normalized.includes("рекоменд")
  ) {
    return "decision";
  }
  if (
    normalized.includes("evidence") ||
    normalized.includes("actual") ||
    normalized.includes("expected") ||
    normalized.includes("request") ||
    normalized.includes("response") ||
    normalized.includes("step") ||
    normalized.includes("шаг") ||
    normalized.includes("скрин")
  ) {
    return "evidence";
  }
  if (
    normalized.includes("risk") ||
    normalized.includes("impact") ||
    normalized.includes("user") ||
    normalized.includes("риск") ||
    normalized.includes("пользователь")
  ) {
    return "risk";
  }
  if (
    normalized.includes("test") ||
    normalized.includes("case") ||
    normalized.includes("scenario") ||
    normalized.includes("check") ||
    normalized.includes("провер") ||
    normalized.includes("сценар")
  ) {
    return "testIdea";
  }
  return "observation";
}

const reviewTargetLabels: Record<ReviewActionItem["target"], string> = {
  observation: "Наблюдение",
  risk: "Риск",
  testIdea: "Проверка",
  evidence: "Evidence",
  decision: "Вывод",
};

export function buildReviewActionPlan(input: ReviewActionPlanInput): ReviewActionItem[] {
  const feedback = input.feedback?.filter(Boolean).slice(0, 3) ?? [];
  const nextSteps = input.nextSteps?.filter(Boolean).slice(0, 3) ?? [];
  const items = [
    ...feedback.map((text, index) => ({ source: "feedback" as const, text, index })),
    ...nextSteps.map((text, index) => ({ source: "nextStep" as const, text, index })),
  ].slice(0, 5);

  return items.map((item) => {
    const target = reviewTargetFromText(item.text);

    return {
      id: `${item.source}-${item.index}-${target}`,
      source: item.source,
      text: item.text,
      target,
      label: reviewTargetLabels[target],
    };
  });
}
