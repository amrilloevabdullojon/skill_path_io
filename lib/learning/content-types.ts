export type RuntimeContentSource =
  | "prisma-track"
  | "prisma-course"
  | "studio-course"
  | "seed-track";

export type RuntimeCategory =
  | "QA"
  | "BA"
  | "DA"
  | "PRODUCT"
  | "MANAGEMENT"
  | "GENERAL";

export type RuntimeLevel =
  | "BEGINNER"
  | "JUNIOR"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "UNKNOWN";

export type RuntimeStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED"
  | "UNKNOWN";

export type RuntimeVisibility = "PUBLIC" | "PRIVATE" | "HIDDEN";

export type RuntimeLessonBlock = {
  id: string;
  type: string;
  content: string;
  order: number;
  config: Record<string, unknown>;
};

export type RuntimeLesson = {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  description: string;
  body: string;
  lessonType: string;
  estimatedDuration: number;
  status: RuntimeStatus;
  blocks: RuntimeLessonBlock[];
};

export type RuntimeQuestion = {
  id: string;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string[];
};

export type RuntimeQuiz = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number;
  status: RuntimeStatus;
  questions: RuntimeQuestion[];
};

export type RuntimeMission = {
  id: string;
  title: string;
  scenario: string;
  objective: string;
  xpReward: number;
  difficulty: string;
  status: RuntimeStatus;
};

export type RuntimeSimulation = {
  id: string;
  title: string;
  description: string;
  simulationType: string;
  xpReward: number;
  difficulty: string;
  status: RuntimeStatus;
};

export type RuntimeModule = {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  estimatedDuration: number;
  xpReward: number;
  status: RuntimeStatus;
  visibility: RuntimeVisibility;
  content: Record<string, unknown>;
  lessons: RuntimeLesson[];
  quiz: RuntimeQuiz | null;
  missions: RuntimeMission[];
  simulations: RuntimeSimulation[];
};

export type RuntimeCourse = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  category: RuntimeCategory;
  level: RuntimeLevel;
  estimatedDuration: number;
  status: RuntimeStatus;
  visibility: RuntimeVisibility;
  source: RuntimeContentSource;
  tags: string[];
  icon: string;
  color: string;
  modules: RuntimeModule[];
};

export type RuntimeCatalog = {
  source: RuntimeContentSource | "mixed";
  courses: RuntimeCourse[];
};

