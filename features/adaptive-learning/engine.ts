import { AdaptiveSignal, AdaptiveSuggestion } from "@/types/personalization";

function priority(value: number): AdaptiveSuggestion["priority"] {
  if (value >= 75) return "Low";
  if (value >= 55) return "Medium";
  return "High";
}

export function buildAdaptiveSuggestions(signal: AdaptiveSignal): AdaptiveSuggestion[] {
  const suggestions: AdaptiveSuggestion[] = [];

  if (signal.quizAccuracy < 75) {
    suggestions.push({
      id: "adaptive-remedial-quiz",
      title: "Укрепить слабые темы теста",
      reason: `Точность в тестах: ${signal.quizAccuracy}%.`,
      action: "Повторите ключевые блоки урока и пересдайте слабый тест.",
      priority: priority(signal.quizAccuracy),
      href: "/review",
      type: "remedial",
    });
  }

  if (signal.simulationPerformance < 70) {
    suggestions.push({
      id: "adaptive-practice-sim",
      title: "Отработать реальную симуляцию",
      reason: `Результат симуляции: ${signal.simulationPerformance}%.`,
      action: "Пройдите одну сфокусированную симуляцию с обратной связью от ИИ.",
      priority: priority(signal.simulationPerformance),
      href: "/missions",
      type: "practice",
    });
  }

  if (signal.skippedLessons >= 2) {
    suggestions.push({
      id: "adaptive-review-skipped",
      title: "Наверстать пропущенные уроки",
      reason: `${signal.skippedLessons} уроков было пропущено недавно.`,
      action: "Используйте карточки быстрого повторения и пройдите короткий обзорный тест.",
      priority: "High",
      href: "/review",
      type: "review",
    });
  }

  if (signal.quizAccuracy >= 82 && signal.simulationPerformance >= 78) {
    suggestions.push({
      id: "adaptive-accelerate",
      title: "Путь ускорения разблокирован",
      reason: "Отличные результаты в тестах и симуляциях.",
      action: "Пропустите необязательное повторение и переходите к испытанию.",
      priority: "Low",
      href: "/missions",
      type: "acceleration",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "adaptive-keep-pace",
      title: "Поддерживать темп обучения",
      reason: "Результаты стабильны по всем модулям.",
      action: "Продолжайте следующий модуль и сохраняйте привычку еженедельного повторения.",
      priority: "Medium",
      href: "/planner",
      type: "practice",
    });
  }

  return suggestions.slice(0, 5);
}

export function buildRecoveryPlan(signal: AdaptiveSignal) {
  const focus = signal.frequentMistakes.slice(0, 3);
  return [
    `Повторить урок по теме: ${focus[0] ?? "ключевая концепция"}`,
    "Пересдать связанный тест, целевой балл — 80%+",
    "Пройти одно практическое задание по той же теме",
    "Открыть ИИ-ментора и попросить упрощённое объяснение",
  ];
}
