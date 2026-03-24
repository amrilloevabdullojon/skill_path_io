import { ProgressStatus, TrackCategory } from "@prisma/client";

type ModuleProgressLike = {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  content: unknown;
  lessonsCount: number;
  quizCount: number;
};

type UserProgressLike = {
  moduleId: string;
  status: ProgressStatus;
  score: number | null;
  completedAt: Date | null;
};

export type LearningPathState = "locked" | "available" | "in_progress" | "completed";

export type ParsedModuleContent = {
  overview: string;
  outcomes: string[];
  resources: string[];
  objectives: string[];
  skills: string[];
  whatYouWillLearn: string[];
  finalChallenge: string;
  realWorldExample: string;
  quickChecks: string[];
};

export type ModuleProgressionCard = {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  xpReward: number;
  lessonXpReward: number;
  quizXpReward: number;
  simulationXpReward: number;
  lessonsCount: number;
  quizCount: number;
  simulationCount: number;
  practiceCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progressPercent: number;
  state: LearningPathState;
  stateLabel: string;
  unlockRequirement: string | null;
  outcomes: string[];
  objectives: string[];
  skills: string[];
  finalChallenge: string;
  realWorldExample: string;
  quickChecks: string[];
};

export type TrackProgressionSummary = {
  modules: ModuleProgressionCard[];
  completedCount: number;
  inProgressCount: number;
  totalModules: number;
  overallProgressPercent: number;
  estimatedMinutesLeft: number;
  totalXpAvailable: number;
  earnedXp: number;
  unlockedSkills: string[];
  earnedBadges: string[];
  completionStreakDays: number;
  isTrackCompleted: boolean;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function fallbackFinalChallenge(category: TrackCategory, moduleTitle: string, order: number) {
  if (category === TrackCategory.QA) {
    return `Final challenge ${order}: find 5 meaningful bugs related to "${moduleTitle}".`;
  }
  if (category === TrackCategory.BA) {
    return `Final challenge ${order}: write a user story with acceptance criteria for "${moduleTitle}".`;
  }
  return `Final challenge ${order}: analyze a small dataset and present insights for "${moduleTitle}".`;
}

function fallbackRealWorldExample(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "Real world example: how Netflix validates API quality before releases.";
  }
  if (category === TrackCategory.BA) {
    return "Real world example: how Amazon teams define user stories for marketplace features.";
  }
  return "Real world example: how Spotify analysts measure retention and engagement.";
}

function fallbackSkills(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return ["Test design", "API testing", "Bug reporting", "Regression strategy"];
  }
  if (category === TrackCategory.BA) {
    return ["User stories", "Requirements", "Stakeholder communication", "Process mapping"];
  }
  return ["SQL", "Metrics", "Data storytelling", "Dashboard thinking"];
}

function badgePool(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return ["API Beginner", "Bug Hunter", "Quality Guardian", "Automation Rookie", "Test Strategist"];
  }
  if (category === TrackCategory.BA) {
    return ["Story Crafter", "Requirement Mapper", "Stakeholder Partner", "Process Designer", "BA Navigator"];
  }
  return ["SQL Explorer", "Insight Finder", "Dashboard Crafter", "Analytics Operator", "Data Pathfinder"];
}

export function parseModuleContent(content: unknown, category: TrackCategory, moduleTitle: string, moduleOrder: number): ParsedModuleContent {
  if (!isRecord(content)) {
    return {
      overview: "",
      outcomes: [],
      resources: [],
      objectives: [],
      skills: fallbackSkills(category),
      whatYouWillLearn: [],
      finalChallenge: fallbackFinalChallenge(category, moduleTitle, moduleOrder),
      realWorldExample: fallbackRealWorldExample(category),
      quickChecks: [],
    };
  }

  return {
    overview: typeof content.overview === "string" ? content.overview : "",
    outcomes: toStringArray(content.outcomes),
    resources: toStringArray(content.resources),
    objectives: toStringArray(content.objectives),
    skills: toStringArray(content.skills).length > 0 ? toStringArray(content.skills) : fallbackSkills(category),
    whatYouWillLearn: toStringArray(content.whatYouWillLearn),
    finalChallenge:
      typeof content.finalChallenge === "string" && content.finalChallenge.trim()
        ? content.finalChallenge
        : fallbackFinalChallenge(category, moduleTitle, moduleOrder),
    realWorldExample:
      typeof content.realWorldExample === "string" && content.realWorldExample.trim()
        ? content.realWorldExample
        : fallbackRealWorldExample(category),
    quickChecks: toStringArray(content.quickChecks),
  };
}

function stateLabel(state: LearningPathState) {
  if (state === "completed") return "Completed";
  if (state === "in_progress") return "In progress";
  if (state === "available") return "Available";
  return "Locked";
}

function progressionPercent(status: ProgressStatus, score: number | null, isUnlocked: boolean) {
  if (status === ProgressStatus.COMPLETED) return 100;
  if (status === ProgressStatus.IN_PROGRESS) {
    if (typeof score === "number") {
      return clamp(Math.round(score * 0.75), 20, 92);
    }
    return 55;
  }
  return isUnlocked ? 8 : 0;
}

function difficultyByOrder(order: number, total: number): "Beginner" | "Intermediate" | "Advanced" {
  if (order <= Math.ceil(total / 3)) return "Beginner";
  if (order >= Math.ceil((total * 2) / 3)) return "Advanced";
  return "Intermediate";
}

function simulationCountByOrder(order: number, totalModules: number) {
  if (order === totalModules) return 1;
  return order % 2 === 0 ? 1 : 0;
}

function currentStreak(completedDates: Date[]) {
  if (completedDates.length === 0) return 0;
  const uniqueDays = [...new Set(completedDates.map((date) => date.toISOString().slice(0, 10)))].sort();
  let streak = 1;
  let cursor = new Date(uniqueDays[uniqueDays.length - 1]);

  for (let index = uniqueDays.length - 2; index >= 0; index -= 1) {
    const previous = new Date(uniqueDays[index]);
    const diffDays = (cursor.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak += 1;
      cursor = previous;
      continue;
    }
    break;
  }
  return streak;
}

export function buildTrackProgression(params: {
  category: TrackCategory;
  modules: ModuleProgressLike[];
  userProgress: UserProgressLike[];
}) : TrackProgressionSummary {
  const { category, modules, userProgress } = params;
  const totalModules = modules.length;
  const progressByModuleId = new Map(userProgress.map((progress) => [progress.moduleId, progress]));
  const moduleCards: ModuleProgressionCard[] = [];

  let completedCount = 0;
  let inProgressCount = 0;
  let estimatedMinutesLeft = 0;
  let totalXpAvailable = 0;
  let earnedXp = 0;
  const unlockedSkills: string[] = [];
  const completedDates: Date[] = [];

  for (let index = 0; index < modules.length; index += 1) {
    const moduleItem = modules[index];
    const progress = progressByModuleId.get(moduleItem.id);
    const parsedContent = parseModuleContent(moduleItem.content, category, moduleItem.title, moduleItem.order);
    const simulationCount = simulationCountByOrder(moduleItem.order, totalModules);
    const lessonXp = moduleItem.lessonsCount * 20;
    const quizXp = moduleItem.quizCount * 50;
    const simulationXp = simulationCount * 100;
    const xpReward = lessonXp + quizXp + simulationXp;
    const requiredXp = Math.max(0, (moduleItem.order - 1) * 100);
    const previousModule = index > 0 ? modules[index - 1] : null;
    const previousProgress = previousModule ? progressByModuleId.get(previousModule.id) : null;
    const previousQuizPassed = (previousProgress?.score ?? 0) >= 70 || previousProgress?.status === ProgressStatus.COMPLETED;

    const unlockedByFlow = index === 0 || previousQuizPassed;
    const unlockedByXp = earnedXp >= requiredXp;
    const isUnlocked = unlockedByFlow || unlockedByXp;

    const status = progress?.status ?? ProgressStatus.NOT_STARTED;
    let state: LearningPathState = "locked";
    if (status === ProgressStatus.COMPLETED) {
      state = "completed";
    } else if (status === ProgressStatus.IN_PROGRESS) {
      state = "in_progress";
    } else if (isUnlocked) {
      state = "available";
    }

    const progressPercent = progressionPercent(status, progress?.score ?? null, isUnlocked);
    const difficulty = difficultyByOrder(moduleItem.order, totalModules);

    if (status === ProgressStatus.COMPLETED) {
      completedCount += 1;
      earnedXp += xpReward;
      parsedContent.skills.slice(0, 2).forEach((skill) => unlockedSkills.push(skill));
      if (progress?.completedAt) {
        completedDates.push(progress.completedAt);
      }
    } else if (status === ProgressStatus.IN_PROGRESS) {
      inProgressCount += 1;
      earnedXp += Math.round(xpReward * 0.45);
      estimatedMinutesLeft += Math.round(moduleItem.duration * 0.6);
    } else {
      estimatedMinutesLeft += moduleItem.duration;
    }

    totalXpAvailable += xpReward;

    moduleCards.push({
      id: moduleItem.id,
      order: moduleItem.order,
      title: moduleItem.title,
      shortDescription: moduleItem.description,
      durationMinutes: moduleItem.duration,
      xpReward,
      lessonXpReward: lessonXp,
      quizXpReward: quizXp,
      simulationXpReward: simulationXp,
      lessonsCount: moduleItem.lessonsCount,
      quizCount: moduleItem.quizCount,
      simulationCount,
      practiceCount: parsedContent.resources.length > 0 ? parsedContent.resources.length : 1,
      difficulty,
      progressPercent,
      state,
      stateLabel: stateLabel(state),
      unlockRequirement: state === "locked" ? `Complete previous quiz or earn ${requiredXp} XP` : null,
      outcomes: parsedContent.outcomes,
      objectives: parsedContent.objectives,
      skills: parsedContent.skills,
      finalChallenge: parsedContent.finalChallenge,
      realWorldExample: parsedContent.realWorldExample,
      quickChecks: parsedContent.quickChecks,
    });
  }

  const overallProgressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const badges = badgePool(category).slice(0, Math.max(1, completedCount));

  return {
    modules: moduleCards,
    completedCount,
    inProgressCount,
    totalModules,
    overallProgressPercent,
    estimatedMinutesLeft,
    totalXpAvailable,
    earnedXp,
    unlockedSkills: Array.from(new Set(unlockedSkills)),
    earnedBadges: badges,
    completionStreakDays: currentStreak(completedDates),
    isTrackCompleted: totalModules > 0 && completedCount === totalModules,
  };
}

export function buildTrackSkillRadar(params: {
  category: TrackCategory;
  progression: TrackProgressionSummary;
}) {
  const { category, progression } = params;
  const base = progression.overallProgressPercent;
  const completedBoost = progression.completedCount * 7;

  if (category === TrackCategory.QA) {
    return [
      { skill: "Testing", value: clamp(base + completedBoost) },
      { skill: "API", value: clamp(base + 10) },
      { skill: "Automation", value: clamp(base - 6 + completedBoost) },
      { skill: "SQL", value: clamp(base - 18 + completedBoost) },
      { skill: "Communication", value: clamp(base - 8 + completedBoost) },
    ];
  }
  if (category === TrackCategory.BA) {
    return [
      { skill: "User Stories", value: clamp(base + completedBoost) },
      { skill: "Requirements", value: clamp(base + 8) },
      { skill: "Communication", value: clamp(base + 5 + completedBoost) },
      { skill: "Analytics", value: clamp(base - 12 + completedBoost) },
      { skill: "SQL", value: clamp(base - 18 + completedBoost) },
    ];
  }
  return [
    { skill: "SQL", value: clamp(base + completedBoost) },
    { skill: "Analytics", value: clamp(base + 8 + completedBoost) },
    { skill: "Visualization", value: clamp(base + 6) },
    { skill: "API", value: clamp(base - 12 + completedBoost) },
    { skill: "Communication", value: clamp(base - 7 + completedBoost) },
  ];
}

export function trackCareerOutcome(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "Career outcome: Junior QA -> QA Engineer -> QA Automation Engineer.";
  }
  if (category === TrackCategory.BA) {
    return "Career outcome: Junior BA -> Product Analyst -> Business Analyst.";
  }
  return "Career outcome: Junior Data Analyst -> Product Analyst -> Senior Data Analyst.";
}

export function trackNextSuggestion(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return "Next suggested track: Business Analyst";
  }
  if (category === TrackCategory.BA) {
    return "Next suggested track: Data Analyst";
  }
  return "Next suggested track: QA Engineer";
}

export function trackWhatYouLearn(category: TrackCategory) {
  if (category === TrackCategory.QA) {
    return [
      "Test strategy and test case design",
      "API testing workflows and bug lifecycle",
      "Regression planning and release quality checks",
    ];
  }
  if (category === TrackCategory.BA) {
    return [
      "Requirement elicitation and stakeholder interviews",
      "User story writing and acceptance criteria",
      "Process modeling and specification handoff",
    ];
  }
  return [
    "SQL analysis and metric design",
    "Product analytics and experimentation basics",
    "Dashboard storytelling for business decisions",
  ];
}
