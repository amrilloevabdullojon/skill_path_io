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
