import {
  AdaptiveSignal,
  CareerGoal,
  DiscussionThread,
  JobPosting,
  KnowledgeNode,
  LearningMission,
  LearningPlan,
  OnboardingProfile,
  StudentAnalyticsSnapshot,
  StudyGroup,
  TrackTag,
  UserBookmark,
  UserNote,
  WeeklyQuest,
} from "@/types/personalization";

const nowIso = new Date().toISOString();

export const defaultOnboardingProfile: OnboardingProfile = {
  id: "onb-local-1",
  userId: "local-user",
  profession: "QA",
  currentLevel: "FOUNDATION",
  goal: "Get Junior QA-ready portfolio in 3 months",
  hoursPerWeek: 7,
  targetMonths: 3,
  interests: ["API Testing", "Bug Reports", "SQL Basics"],
  createdAt: nowIso,
  updatedAt: nowIso,
};

export const careerGoalsSeed: CareerGoal[] = [
  {
    id: "goal-qa-jr",
    role: "Junior QA",
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    requiredSkills: ["Manual Testing", "API Testing", "Bug Report Quality", "Regression"],
  },
  {
    id: "goal-ba-jr",
    role: "Junior BA",
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
    requiredSkills: ["User Stories", "Acceptance Criteria", "Stakeholder Discovery", "Process Mapping"],
  },
  {
    id: "goal-da-jr",
    role: "Junior Data Analyst",
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
    requiredSkills: ["SQL", "Metrics", "Dashboards", "Insight Storytelling"],
  },
];

export const adaptiveSignalSeed: AdaptiveSignal = {
  quizAccuracy: 72,
  frequentMistakes: ["API status code edge cases", "JOIN type selection", "Acceptance criteria specificity"],
  timeSpentMinutes: 860,
  completedModules: 5,
  skippedLessons: 3,
  simulationPerformance: 66,
};

export const jobPostingsSeed: JobPosting[] = [
  {
    id: "job-qa-1",
    title: "Junior QA Engineer",
    level: "Junior",
    location: "Remote, EMEA",
    requiredSkills: ["Manual Testing", "API Testing", "Bug Tracking", "SQL Basics"],
    description: "Own feature QA checks and maintain bug quality with product squads.",
    roleTrack: "QA",
  },
  {
    id: "job-ba-1",
    title: "Junior Business Analyst",
    level: "Junior",
    location: "Hybrid, Tashkent",
    requiredSkills: ["User Stories", "Acceptance Criteria", "Stakeholder Communication", "Backlog Grooming"],
    description: "Translate business needs into clear, testable requirements.",
    roleTrack: "BA",
  },
  {
    id: "job-da-1",
    title: "Junior Data Analyst",
    level: "Junior",
    location: "Remote",
    requiredSkills: ["SQL", "Dashboards", "A/B Basics", "Communication"],
    description: "Build product insights and support decision-making with clear metrics.",
    roleTrack: "DA",
  },
  {
    id: "job-qa-2",
    title: "QA Intern",
    level: "Intern",
    location: "On-site, Tashkent",
    requiredSkills: ["Testing Fundamentals", "Bug Reports", "Attention to Detail"],
    description: "Entry role to support release verification and smoke tests.",
    roleTrack: "QA",
  },
];

export const missionsSeed: LearningMission[] = [
  {
    id: "mission-qa-api-bug",
    title: "Расследование API-бага",
    scenario: "Релиз-кандидат API возвращает непоследовательные статус-коды.",
    roleContext: "Вы QA на неделе закрытия спринта.",
    objective: "Расследовать и оформить воспроизводимый баг-репорт.",
    steps: ["Изучить документацию API", "Выполнить тестовые запросы", "Собрать evidence", "Написать баг-репорт"],
    skillsUsed: ["API Testing", "Bug Reporting", "Root Cause Analysis"],
    expectedResult: "Чёткий тикет с severity, шагами воспроизведения и expected/actual.",
    difficulty: "Medium",
    xpReward: 140,
    aiEvaluation: true,
    category: "QA",
    status: "available",
  },
  {
    id: "mission-ba-story",
    title: "Запрос стейкхолдера → User Story",
    scenario: "Продажи просят ускорить чек-аут для мобильных пользователей.",
    roleContext: "Вы BA на discovery-воркшопе.",
    objective: "Превратить запрос в story + критерии приёмки.",
    steps: ["Уточнить цель", "Определить роль пользователя", "Набросать story", "Написать acceptance criteria"],
    skillsUsed: ["Stakeholder Discovery", "User Stories", "Acceptance Criteria"],
    expectedResult: "Готовая к работе карточка истории для backlog grooming.",
    difficulty: "Easy",
    xpReward: 120,
    aiEvaluation: true,
    category: "BA",
    status: "in_progress",
  },
  {
    id: "mission-da-insight",
    title: "Глубокий разбор retention-датасета",
    scenario: "Отток вырос на 7% за последние две недели.",
    roleContext: "Вы DA, помогаете продакт-лиду.",
    objective: "Проанализировать данные и представить три actionable инсайта.",
    steps: ["Написать SQL-запрос", "Построить быстрый чарт", "Интерпретировать тренд", "Сформулировать действия"],
    skillsUsed: ["SQL", "Data Visualization", "Insight Communication"],
    expectedResult: "Инсайт-меморандум с рекомендациями и пометками об уверенности.",
    difficulty: "Hard",
    xpReward: 180,
    aiEvaluation: true,
    category: "DA",
    status: "locked",
  },
];

export const weeklyQuestsSeed: WeeklyQuest[] = [
  {
    id: "quest-lessons",
    title: "Пройти 3 урока",
    description: "Заверши хотя бы 3 урока за эту неделю.",
    goal: 3,
    progress: 2,
    rewardXp: 90,
    status: "in_progress",
  },
  {
    id: "quest-quiz",
    title: "Сдать тест на 80%+",
    description: "Набери минимум 80% хотя бы в одном модульном тесте.",
    goal: 1,
    progress: 1,
    rewardXp: 120,
    status: "completed",
  },
  {
    id: "quest-simulation",
    title: "Закрыть 1 симуляцию",
    description: "Заверши одну рабочую симуляцию.",
    goal: 1,
    progress: 0,
    rewardXp: 160,
    status: "not_started",
  },
  {
    id: "quest-streak",
    title: "Серия в 5 дней",
    description: "Учись 5 дней подряд без перерывов.",
    goal: 5,
    progress: 3,
    rewardXp: 140,
    status: "in_progress",
  },
];

export const notesSeed: UserNote[] = [
  {
    id: "note-1",
    title: "Чек-лист API-тестов",
    content: "Перед запуском suite: auth token, карта статус-кодов, негативные payload.",
    track: "QA",
    lessonRef: "Основы API-тестирования",
    createdAt: nowIso,
  },
  {
    id: "note-2",
    title: "Качество user story",
    content: "Всегда проверяй: роль, ценность для пользователя, измеримые критерии приёмки.",
    track: "BA",
    lessonRef: "Воркшоп по user story",
    createdAt: nowIso,
  },
];

export const bookmarksSeed: UserBookmark[] = [
  {
    id: "bm-1",
    title: "Module: API Testing",
    href: "/tracks/qa-engineer/modules/mock-module-1",
    type: "module",
    tag: "QA",
  },
  {
    id: "bm-2",
    title: "Quiz: SQL Basics",
    href: "/tracks/data-analyst/modules/mock-module-2/quiz",
    type: "quiz",
    tag: "DA",
  },
  {
    id: "bm-3",
    title: "Mission: Stakeholder Story",
    href: "/missions",
    type: "mission",
    tag: "BA",
  },
];

export const threadsSeed: DiscussionThread[] = [
  {
    id: "thread-1",
    moduleTitle: "API Testing",
    title: "How to prioritize status-code edge cases?",
    author: "A. Karimov",
    replies: 14,
    lastActivity: "12m ago",
    tags: ["QA", "API", "Regression"],
  },
  {
    id: "thread-2",
    moduleTitle: "Requirements",
    title: "Acceptance criteria examples for cancellation flow",
    author: "M. Chen",
    replies: 8,
    lastActivity: "1h ago",
    tags: ["BA", "User Story"],
  },
  {
    id: "thread-3",
    moduleTitle: "SQL for Analysts",
    title: "LEFT JOIN vs INNER JOIN in retention tasks",
    author: "S. Khan",
    replies: 19,
    lastActivity: "3h ago",
    tags: ["DA", "SQL"],
  },
];

export const groupsSeed: StudyGroup[] = [
  {
    id: "group-qa",
    name: "Bug Hunters Guild",
    topic: "API and exploratory testing",
    members: 22,
    description: "Weekly bug triage and report quality sessions.",
    mode: "Open",
  },
  {
    id: "group-ba",
    name: "Story Architects",
    topic: "Requirements and stakeholder communication",
    members: 15,
    description: "Review stories and acceptance criteria in peer circles.",
    mode: "Invite",
  },
  {
    id: "group-da",
    name: "Insight Crew",
    topic: "SQL and dashboard storytelling",
    members: 18,
    description: "Practice analytics challenges and compare insight quality.",
    mode: "Open",
  },
];

export const knowledgeMapSeed: KnowledgeNode[] = [
  {
    id: "node-testing-manual",
    title: "Manual Testing",
    category: "Testing",
    dependencies: [],
    completed: true,
    recommended: false,
    locked: false,
  },
  {
    id: "node-testing-api",
    title: "API Testing",
    category: "Testing",
    dependencies: ["node-testing-manual"],
    completed: false,
    recommended: true,
    locked: false,
  },
  {
    id: "node-testing-regression",
    title: "Regression Testing",
    category: "Testing",
    dependencies: ["node-testing-api"],
    completed: false,
    recommended: false,
    locked: true,
  },
  {
    id: "node-analytics-sql",
    title: "SQL",
    category: "Analytics",
    dependencies: [],
    completed: true,
    recommended: false,
    locked: false,
  },
  {
    id: "node-analytics-dashboard",
    title: "Dashboards",
    category: "Analytics",
    dependencies: ["node-analytics-sql"],
    completed: false,
    recommended: true,
    locked: false,
  },
  {
    id: "node-analytics-metrics",
    title: "Metrics",
    category: "Analytics",
    dependencies: ["node-analytics-dashboard"],
    completed: false,
    recommended: false,
    locked: true,
  },
  {
    id: "node-ba-user-story",
    title: "User Stories",
    category: "Business Analysis",
    dependencies: [],
    completed: true,
    recommended: false,
    locked: false,
  },
  {
    id: "node-ba-criteria",
    title: "Acceptance Criteria",
    category: "Business Analysis",
    dependencies: ["node-ba-user-story"],
    completed: false,
    recommended: true,
    locked: false,
  },
];

export const analyticsSeed: StudentAnalyticsSnapshot = {
  totalLearningMinutes: 1280,
  completedLessons: 24,
  weeklyProgress: [
    { week: "W1", value: 22 },
    { week: "W2", value: 35 },
    { week: "W3", value: 52 },
    { week: "W4", value: 63 },
    { week: "W5", value: 71 },
    { week: "W6", value: 79 },
  ],
  strongestSkills: ["Manual Testing", "SQL", "User Stories"],
  weakestSkills: ["Automation", "A/B Analysis", "Stakeholder Negotiation"],
  averageQuizAccuracy: 74,
  missionCompletionRate: 58,
  simulationPerformance: 66,
  trend: [
    { label: "Mon", progress: 22, accuracy: 69 },
    { label: "Tue", progress: 33, accuracy: 74 },
    { label: "Wed", progress: 31, accuracy: 72 },
    { label: "Thu", progress: 43, accuracy: 78 },
    { label: "Fri", progress: 55, accuracy: 76 },
    { label: "Sat", progress: 48, accuracy: 73 },
    { label: "Sun", progress: 63, accuracy: 80 },
  ],
};

const profileTrackMap: Record<TrackTag, string> = {
  QA: "qa-engineer",
  BA: "business-analyst",
  DA: "data-analyst",
};

export function starterTrackByProfession(profession: TrackTag) {
  return profileTrackMap[profession];
}

export function buildStarterRoadmap(profession: TrackTag) {
  if (profession === "QA") {
    return ["QA Fundamentals", "Test Design", "API Testing", "Bug Tracker Simulation", "Final QA Challenge"];
  }
  if (profession === "BA") {
    return ["BA Role", "Requirements Discovery", "User Story Lab", "Stakeholder Simulation", "Final BA Challenge"];
  }
  return ["Analytics Basics", "SQL for Analysts", "Metrics Design", "Dataset Simulation", "Final DA Challenge"];
}

export function buildBaseLearningPlan(goal: string, weeklyHours: number): LearningPlan {
  const pace = weeklyHours >= 8 ? "Intense" : weeklyHours >= 5 ? "Balanced" : "Light";
  const forecast = new Date();
  forecast.setDate(forecast.getDate() + (pace === "Intense" ? 45 : pace === "Balanced" ? 72 : 95));

  return {
    id: "plan-local-1",
    goal,
    weeklyHours,
    workload: pace,
    forecastDate: forecast.toISOString(),
    tasks: [
      {
        id: "task-1",
        title: "Пройти один ключевой урок",
        type: "lesson",
        durationMinutes: 45,
        day: "Monday",
        priority: "High",
      },
      {
        id: "task-2",
        title: "Сдать тест на 80%+",
        type: "quiz",
        durationMinutes: 35,
        day: "Wednesday",
        priority: "High",
      },
      {
        id: "task-3",
        title: "Пройти одну симуляцию",
        type: "simulation",
        durationMinutes: 60,
        day: "Friday",
        priority: "Medium",
      },
      {
        id: "task-4",
        title: "Быстрое повторение",
        type: "review",
        durationMinutes: 25,
        day: "Sunday",
        priority: "Low",
      },
    ],
  };
}
