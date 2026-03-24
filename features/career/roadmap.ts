export type CareerStage = "Junior" | "Middle" | "Senior";

export type CareerRoadmapStage = {
  stage: CareerStage;
  summary: string;
  skills: string[];
  outcomes: string[];
};

export const CAREER_ROADMAP: CareerRoadmapStage[] = [
  {
    stage: "Junior",
    summary: "Осваивает базу и стабильно выполняет стандартные задачи.",
    skills: [
      "Базовое тестирование / анализ требований / SQL",
      "Работа с документацией и чеклистами",
      "Формулировка корректных вопросов",
    ],
    outcomes: ["Уверенное выполнение задач под менторством", "Понятные отчеты по результатам"],
  },
  {
    stage: "Middle",
    summary: "Берет ответственность за модули, оптимизирует процессы, помогает команде.",
    skills: [
      "Системное мышление и принятие решений по качеству",
      "Глубокий анализ данных/требований/тестового покрытия",
      "Самостоятельное проведение исследований",
    ],
    outcomes: ["Стабильные инициативы по улучшениям", "Менторинг junior-специалистов"],
  },
  {
    stage: "Senior",
    summary: "Проектирует подходы, влияет на стратегию продукта и роста команды.",
    skills: [
      "Архитектурное и продуктовое влияние",
      "Лидерство в процессах и стандартах",
      "Развитие экспертизы команды",
    ],
    outcomes: ["Сильное влияние на KPI команды", "Лидирование сложных кейсов и инициатив"],
  },
];

export function detectCareerStage(overallProgress: number, averageScore: number | null): CareerStage {
  if (overallProgress >= 80 && (averageScore ?? 0) >= 85) {
    return "Senior";
  }
  if (overallProgress >= 45 && (averageScore ?? 0) >= 70) {
    return "Middle";
  }
  return "Junior";
}
