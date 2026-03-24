export type BugSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type BugReportInput = {
  title: string;
  severity: BugSeverity;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
};

export type BugReviewResult = {
  qualityScore: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
};

function scoreByLength(value: string, max = 30) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(words, max);
}

export function reviewBugReportLocally(input: BugReportInput): BugReviewResult {
  const stepScore = scoreByLength(input.stepsToReproduce, 35);
  const expectedScore = scoreByLength(input.expectedResult, 20);
  const actualScore = scoreByLength(input.actualResult, 20);
  const titleScore = scoreByLength(input.title, 12);
  const severityScore = input.severity === "CRITICAL" || input.severity === "HIGH" ? 10 : 7;

  const qualityScore = Math.min(
    100,
    Math.round(((stepScore + expectedScore + actualScore + titleScore + severityScore) / 97) * 100),
  );

  const issues: string[] = [];
  if (stepScore < 10) {
    issues.push("Шаги воспроизведения слишком короткие и могут быть неоднозначными.");
  }
  if (expectedScore < 8) {
    issues.push("Ожидаемый результат описан недостаточно конкретно.");
  }
  if (actualScore < 8) {
    issues.push("Фактический результат требует больше деталей (данные, окружение, симптомы).");
  }

  return {
    qualityScore,
    strengths: [
      "Структура bug report соответствует базовому формату.",
      "Severity указана и помогает в приоритизации.",
    ],
    issues,
    suggestions: [
      "Добавьте пронумерованные шаги с подготовкой тестовых данных.",
      "Укажите окружение (browser/device/API version).",
      "Сформулируйте expected/actual так, чтобы различие было очевидно с первого чтения.",
    ],
  };
}
