import { AdminRole } from "@/types/admin/permissions";

export type CourseCategory = "QA" | "BA" | "DA" | "PRODUCT" | "MANAGEMENT";
export type CourseLevel = "BEGINNER" | "JUNIOR" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type CourseLanguage = "ru" | "en";
export type Visibility = "PUBLIC" | "PRIVATE" | "HIDDEN";
export type BuilderNodeType =
  | "course"
  | "module"
  | "lesson"
  | "quiz"
  | "assignment"
  | "simulation"
  | "case";
export type AssignmentType =
  | "TEXT_TASK"
  | "BUG_REPORT_TASK"
  | "SQL_TASK"
  | "BA_TASK"
  | "CASE_ANALYSIS"
  | "UPLOAD_TASK"
  | "REFLECTIVE_TASK"
  | "AI_REVIEW_TASK";
export type SimulationType =
  | "BUG_TRACKER"
  | "ANALYST_WORKFLOW"
  | "SQL_CHALLENGE"
  | "MOCK_INTERVIEW"
  | "SCENARIO_EXERCISE";
export type QuestionKind =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "MATCH_PAIRS"
  | "REORDER_STEPS"
  | "CASE_BASED";
export type LessonBlockType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "markdown"
  | "bullet_list"
  | "numbered_list"
  | "checklist"
  | "quote"
  | "callout"
  | "key_points"
  | "common_mistakes"
  | "important_note"
  | "real_world_example"
  | "table"
  | "divider"
  | "code_block"
  | "image"
  | "video_embed"
  | "file_attachment"
  | "faq_accordion"
  | "task_block"
  | "summary_block";

export type UnlockRule = {
  prerequisiteModuleIds: string[];
  prerequisiteLessonIds: string[];
  unlockAfterQuizPass: boolean;
  unlockAfterAssignmentCompletion: boolean;
  minScoreToUnlock: number | null;
  requiredXp: number | null;
  optionalContent: boolean;
  hiddenByDefault: boolean;
  scheduleAt: string | null;
};

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  content: string;
  config: Record<string, unknown>;
  order: number;
  collapsed: boolean;
};

export type CourseQuestion = {
  id: string;
  questionText: string;
  questionType: QuestionKind;
  options: Array<{ id: string; label: string; value: string }>;
  correctAnswer: string[] | string;
  explanation: string;
  hint: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  points: number;
  aiExplanationEnabled: boolean;
};

export type CourseQuiz = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  explanationMode: "ON_SUBMIT" | "AFTER_PASS";
  aiReviewEnabled: boolean;
  status: CourseStatus;
  questions: CourseQuestion[];
};

export type CourseLesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number;
  status: CourseStatus;
  blocks: LessonBlock[];
  xpReward: number;
  visibility: Visibility;
  tags: string[];
  draftDirty: boolean;
};

export type CourseAssignment = {
  id: string;
  moduleId: string;
  assignmentType: AssignmentType;
  title: string;
  instructions: string;
  expectedOutput: string;
  evaluationCriteria: string[];
  hints: string[];
  attachments: string[];
  maxScore: number;
  estimatedTime: number;
  aiReviewEnabled: boolean;
  status: CourseStatus;
  tags: string[];
};

export type CourseSimulation = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  simulationType: SimulationType;
  scenario: string;
  steps: string[];
  expectedResult: string;
  aiEvaluationEnabled: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  estimatedTime: number;
  xpReward: number;
  status: CourseStatus;
};

export type CourseCaseStudy = {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  problemStatement: string;
  materials: string[];
  questions: string[];
  expectedApproach: string;
  outcome: string;
  tags: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: CourseStatus;
};

export type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: number;
  status: CourseStatus;
  unlockRule: UnlockRule;
  prerequisiteIds: string[];
  xpReward: number;
  visibility: Visibility;
  icon: string;
  themeColor: string;
};

export type CertificateConfig = {
  enabled: boolean;
  certificateTitle: string;
  certificateTemplate: string;
  signatoryName: string;
  signatoryRole: string;
  logoUrl: string;
  certificateText: string;
  issuanceConditions: string[];
};

export type CourseVersion = {
  id: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
  changelogNote: string;
  snapshot: {
    status: CourseStatus;
    title: string;
    moduleCount: number;
    lessonCount: number;
    quizCount: number;
  };
};

export type AdminActivityLog = {
  id: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  entityType: BuilderNodeType | "template" | "media";
  entityId: string;
  timestamp: string;
  note: string;
};

export type MediaAsset = {
  id: string;
  name: string;
  type: "image" | "file" | "video";
  sizeKb: number;
  url: string;
  uploadedAt: string;
  tags: string[];
};

export type CourseAnalyticsSnapshot = {
  courseId: string;
  enrolledUsers: number;
  completionRate: number;
  averageQuizScore: number;
  averageAssignmentScore: number;
  averageTimeSpentMin: number;
  mostDifficultModule: string;
  topFailedQuizQuestions: string[];
  dropOffPoints: string[];
  mostSkippedLesson: string;
  progressByModule: Array<{ moduleId: string; label: string; completion: number }>;
};

export type CourseTemplate = {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  sourceCourseId: string | null;
  createdAt: string;
  blueprint: {
    modules: number;
    lessonsPerModule: number;
    quizzes: number;
    assignments: number;
    simulations: number;
    cases: number;
  };
  tags: string[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  category: CourseCategory;
  level: CourseLevel;
  language: CourseLanguage;
  coverImage: string;
  icon: string;
  themeColor: string;
  estimatedDuration: number;
  tags: string[];
  outcomes: string[];
  requirements: string[];
  targetAudience: string;
  status: CourseStatus;
  featured: boolean;
  certificateEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdBy: string;
  updatedBy: string;
  version: number;
  visibility: Visibility;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  seoTitle: string;
  seoDescription: string;
  certificateConfig: CertificateConfig;
};

export type CourseStudioEntity = {
  course: Course;
  modules: CourseModule[];
  lessons: CourseLesson[];
  quizzes: CourseQuiz[];
  assignments: CourseAssignment[];
  simulations: CourseSimulation[];
  cases: CourseCaseStudy[];
  versions: CourseVersion[];
  analytics: CourseAnalyticsSnapshot;
};
