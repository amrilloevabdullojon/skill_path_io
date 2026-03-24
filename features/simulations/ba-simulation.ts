export type UserStoryInput = {
  actor: string;
  action: string;
  value: string;
  acceptanceCriteria: string;
};

export type UserStoryReview = {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function reviewUserStoryLocally(input: UserStoryInput): UserStoryReview {
  const actorWords = countWords(input.actor);
  const actionWords = countWords(input.action);
  const valueWords = countWords(input.value);
  const criteriaWords = countWords(input.acceptanceCriteria);

  const score = Math.min(
    100,
    Math.round(
      ((Math.min(actorWords, 8) +
        Math.min(actionWords, 16) +
        Math.min(valueWords, 14) +
        Math.min(criteriaWords, 42)) /
        80) *
        100,
    ),
  );

  const gaps: string[] = [];
  if (actorWords < 2) {
    gaps.push("Роль пользователя указана слишком общо.");
  }
  if (actionWords < 5) {
    gaps.push("Сценарий действия недостаточно конкретен.");
  }
  if (valueWords < 4) {
    gaps.push("Бизнес-ценность сформулирована слабо.");
  }
  if (criteriaWords < 10) {
    gaps.push("Acceptance Criteria слишком короткие для проверки.");
  }

  return {
    score,
    strengths: [
      "Story построена в формате actor-action-value.",
      "Критерии приемки выделены в отдельный блок.",
    ],
    gaps,
    recommendations: [
      "Добавьте edge cases в acceptance criteria.",
      "Опишите ограничения и условия доступа.",
      "Проверьте, что каждый критерий тестируем и бинарно проверяем.",
    ],
  };
}
