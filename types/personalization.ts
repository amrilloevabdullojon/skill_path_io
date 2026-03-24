export type TrackTag = "QA" | "BA" | "DA";

export type UserKnowledgeLevel = "BEGINNER" | "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";

export type ReadinessLevel = "Beginner" | "Foundation" | "Junior-ready" | "Strong Junior" | "Pre-Middle";

export type MissionDifficulty = "Easy" | "Medium" | "Hard";

export type MissionStatus = "locked" | "available" | "in_progress" | "completed";

export type WeeklyQuestStatus = "not_started" | "in_progress" | "completed";

export type OnboardingProfile = {
  id: string;
  userId: string;
  profession: TrackTag;
  currentLevel: UserKnowledgeLevel;
  goal: string;
  hoursPerWeek: number;
  targetMonths: number;
  interests: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdaptiveSignal = {
  quizAccuracy: number;
  frequentMistakes: string[];
  timeSpentMinutes: number;
  completedModules: number;
  skippedLessons: number;
  simulationPerformance: number;
};

export type AdaptiveSuggestion = {
  id: string;
  title: string;
  reason: string;
  action: string;
  priority: "High" | "Medium" | "Low";
  href: string;
  type: "remedial" | "acceleration" | "practice" | "review";
};

export type CareerGoal = {
  id: string;
  role: "Junior QA" | "Junior BA" | "Junior Data Analyst";
  targetDate: string;
  requiredSkills: string[];
};

export type ReadinessSnapshot = {
  score: number;
  level: ReadinessLevel;
  strengths: string[];
  missingSkills: string[];
  nextMilestone: string;
  progressToGoal: number;
};

export type JobPosting = {
  id: string;
  title: string;
  level: "Intern" | "Junior" | "Junior+";
  location: string;
  requiredSkills: string[];
  description: string;
  roleTrack: TrackTag;
};

export type JobMatchResult = JobPosting & {
  matchPercent: number;
  missingRequirements: string[];
  recommendation: string;
};

export type LearningMission = {
  id: string;
  title: string;
  scenario: string;
  roleContext: string;
  objective: string;
  steps: string[];
  skillsUsed: string[];
  expectedResult: string;
  difficulty: MissionDifficulty;
  xpReward: number;
  aiEvaluation: boolean;
  category: TrackTag;
  status: MissionStatus;
};

export type MissionEvaluation = {
  score: number;
  verdict: "Needs improvement" | "Good" | "Excellent";
  strengths: string[];
  improvements: string[];
  recoveryPlan: string[];
};

export type WeeklyQuest = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  rewardXp: number;
  status: WeeklyQuestStatus;
};

export type LearningPlanTask = {
  id: string;
  title: string;
  type: "lesson" | "quiz" | "simulation" | "review" | "mission";
  durationMinutes: number;
  day: string;
  priority: "High" | "Medium" | "Low";
};

export type LearningPlan = {
  id: string;
  goal: string;
  weeklyHours: number;
  forecastDate: string;
  workload: "Light" | "Balanced" | "Intense";
  tasks: LearningPlanTask[];
};

export type KnowledgeNode = {
  id: string;
  title: string;
  category: string;
  dependencies: string[];
  completed: boolean;
  recommended: boolean;
  locked: boolean;
};

export type StudentAnalyticsSnapshot = {
  totalLearningMinutes: number;
  completedLessons: number;
  weeklyProgress: Array<{ week: string; value: number }>;
  strongestSkills: string[];
  weakestSkills: string[];
  averageQuizAccuracy: number;
  missionCompletionRate: number;
  simulationPerformance: number;
  trend: Array<{ label: string; progress: number; accuracy: number }>;
};

export type UserNote = {
  id: string;
  title: string;
  content: string;
  track: TrackTag;
  lessonRef: string;
  createdAt: string;
};

export type UserBookmark = {
  id: string;
  title: string;
  href: string;
  type: "lesson" | "module" | "quiz" | "mission";
  tag: string;
};

export type DiscussionThread = {
  id: string;
  moduleTitle: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  tags: string[];
};

export type StudyGroup = {
  id: string;
  name: string;
  topic: string;
  members: number;
  description: string;
  mode: "Open" | "Invite";
};

export type PortfolioEntrySource = "mission" | "module" | "quiz" | "simulation" | "certificate";

export type PortfolioEntry = {
  id: string;
  title: string;
  description: string;
  skillsUsed: string[];
  resultSummary: string;
  source: PortfolioEntrySource;
  sourceRef: string;
  createdAt: string;
};
