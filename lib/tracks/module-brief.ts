export type ModuleShiftBrief = {
  scene: string;
  stakes: string;
  route: string[];
  artifact: string;
};

type LessonBriefInput = {
  title: string;
};

const QA_SHIFT_BRIEFS: Record<number, Omit<ModuleShiftBrief, "route" | "artifact">> = {
  1: {
    scene: "Вы входите в продуктовую команду перед первой проверкой signup-фичи.",
    stakes: "Новичку важно не запомнить термины, а научиться видеть риск, evidence и влияние на пользователя.",
  },
  2: {
    scene: "Команда спорит о login story: требования размыты, edge cases не названы, release уже близко.",
    stakes: "Ошибочный тест-дизайн пропустит сценарии, где пользователь теряет доступ или получает непонятную ошибку.",
  },
  3: {
    scene: "Profile settings после redesign выглядят готовыми, но browser test run должен доказать, что flow устойчив.",
    stakes: "Если состояние, валидация или mobile layout сломаны, пользователь потеряет доверие к аккаунту.",
  },
  4: {
    scene: "UI показывает generic error, frontend и backend спорят, а API response хранит настоящую причину.",
    stakes: "Без request/response evidence команда будет чинить симптомы вместо контракта.",
  },
  5: {
    scene: "До release review остаются минуты, и QA должен собрать факты в понятное решение: ship or block.",
    stakes: "Слабая рекомендация выпускает риск в прод; сильная показывает blockers, open risks и retest plan.",
  },
};

export function buildQaShiftBrief(params: {
  moduleOrder: number;
  lessons: LessonBriefInput[];
  finalChallenge: string;
}): ModuleShiftBrief | null {
  const baseBrief = QA_SHIFT_BRIEFS[params.moduleOrder];
  if (!baseBrief) {
    return null;
  }

  return {
    ...baseBrief,
    route: params.lessons.slice(0, 3).map((lesson, index) => `${index + 1}. ${lesson.title}`),
    artifact: params.finalChallenge,
  };
}
