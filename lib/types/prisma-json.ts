/**
 * Typed shapes for Prisma `Json` fields.
 *
 * Prisma stores these as `JsonValue` (unknown at compile time). Use these types
 * to cast the raw value to a strongly-typed shape at the call site:
 *
 *   const tags = row.tags as PrismaJson.Tags;
 *
 * Or use the provided cast helpers for safe, zero-cost conversions:
 *
 *   const tags = castTags(row.tags);
 */

// ── Primitives ────────────────────────────────────────────────────────────────

export type StringArray = string[];

// ── Course / Module ───────────────────────────────────────────────────────────

/** Course.tags, CourseLesson.tags, Assignment.tags, etc. */
export type Tags = StringArray;

/** Course.outcomes — list of learning outcomes */
export type Outcomes = StringArray;

/** Course.requirements — prerequisite descriptions */
export type Requirements = StringArray;

/** CourseModule.unlockRule */
export interface UnlockRule {
  type?: "none" | "previous_completed" | "score_threshold";
  threshold?: number;
  moduleId?: string;
}

/** CourseModule.prerequisiteIds */
export type PrerequisiteIds = StringArray;

/** LessonBlock.config — block-specific rendering options */
export type LessonBlockConfig = Record<string, unknown>;

// ── Quiz / Assignment ─────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

/** CourseQuestion.options */
export type QuestionOptions = QuizOption[];

/** CourseQuestion.correctAnswer — array of option IDs */
export type CorrectAnswer = StringArray;

export interface EvaluationCriterion {
  id: string;
  label: string;
  weight?: number;
}

/** Assignment.evaluationCriteria */
export type EvaluationCriteria = EvaluationCriterion[];

/** Assignment.hints */
export type Hints = StringArray;

export interface Attachment {
  name: string;
  url: string;
  type?: string;
}

/** Assignment.attachments */
export type Attachments = Attachment[];

// ── Simulation / Mission ──────────────────────────────────────────────────────

export interface SimulationStep {
  id: string;
  title: string;
  description?: string;
  expectedAction?: string;
}

/** Simulation.steps */
export type SimulationSteps = SimulationStep[];

export interface MissionStep {
  id: string;
  instruction: string;
  hint?: string;
}

/** LearningMission.steps */
export type MissionSteps = MissionStep[];

// ── Career / Goals ────────────────────────────────────────────────────────────

/** CareerGoal.requiredSkills, JobRole.requiredSkills, JobPosting.requiredSkills */
export type RequiredSkills = StringArray;

/** JobPosting.responsibilities */
export type Responsibilities = StringArray;

// ── User Profile ──────────────────────────────────────────────────────────────

/** UserProfile.preferredSkills, UserProfile.goals */
export type PreferredSkills = StringArray;
export type Goals = StringArray;

/** OnboardingProfile.interestedSkills, OnboardingProfile.roadmap */
export type InterestedSkills = StringArray;
export interface RoadmapItem {
  moduleId?: string;
  title: string;
  estimatedWeeks?: number;
}
export type Roadmap = RoadmapItem[];

// ── Portfolio ─────────────────────────────────────────────────────────────────

/** PortfolioProject.skillsUsed */
export type SkillsUsed = StringArray;

// ── Analytics / Reporting ─────────────────────────────────────────────────────

export interface ModuleProgress {
  moduleId: string;
  title: string;
  completionRate: number;
}

/** CourseAnalyticsSnapshot.progressByModule */
export type ProgressByModule = ModuleProgress[];

/** CourseAnalyticsSnapshot.topFailedQuizQuestions */
export type TopFailedQuizQuestions = Array<{ questionId: string; failRate: number }>;

/** CourseAnalyticsSnapshot.dropOffPoints */
export type DropOffPoints = Array<{ moduleId: string; dropRate: number }>;

// ── Snapshots ─────────────────────────────────────────────────────────────────

/** ReadinessScoreSnapshot.breakdown */
export interface ReadinessBreakdown {
  technical?: number;
  communication?: number;
  problemSolving?: number;
  [key: string]: number | undefined;
}

// ── Planner ───────────────────────────────────────────────────────────────────

export interface PlannerTask {
  id: string;
  title: string;
  moduleId?: string;
  dueDate?: string;
  completed?: boolean;
}

/** LearningPlan.tasks */
export type PlannerTasks = PlannerTask[];

// ── Permissions ───────────────────────────────────────────────────────────────

/** PermissionRole.permissions */
export type Permissions = StringArray;

// ── Certificate ───────────────────────────────────────────────────────────────

export interface IssuanceCondition {
  type: "quiz_pass" | "assignment_pass" | "completion";
  threshold?: number;
}

/** CertificateConfig.issuanceConditions */
export type IssuanceConditions = IssuanceCondition[];

// ── CourseTemplate / CourseVersion ────────────────────────────────────────────

/** CourseTemplate.blueprint, CourseVersion.snapshot */
export type CourseBlueprint = Record<string, unknown>;

// ── WeeklyQuest ───────────────────────────────────────────────────────────────

export interface QuestCondition {
  type: string;
  target?: number;
  trackCategory?: string;
}

/** WeeklyQuest.conditions */
export type QuestConditions = QuestCondition[];

// ── CaseStudy ─────────────────────────────────────────────────────────────────

export interface CaseStudyMaterial {
  title: string;
  url?: string;
  type?: string;
}

/** CaseStudy.materials */
export type CaseStudyMaterials = CaseStudyMaterial[];

export interface CaseStudyQuestion {
  id: string;
  text: string;
  expectedAnswer?: string;
}

/** CaseStudy.questions */
export type CaseStudyQuestions = CaseStudyQuestion[];

// ── MissionSubmission ─────────────────────────────────────────────────────────

export interface MissionFeedbackItem {
  criterion: string;
  passed: boolean;
  comment?: string;
}

/** MissionSubmission.feedback */
export type MissionFeedback = MissionFeedbackItem[];

// ── Module (legacy) ───────────────────────────────────────────────────────────

/** Module.content */
export type ModuleContent = Record<string, unknown>;

// ── Question (legacy) ─────────────────────────────────────────────────────────

/** Question.options, Question.correctAnswer */
export type LegacyQuestionOptions = QuizOption[];
export type LegacyCorrectAnswer = CorrectAnswer;

// ── MediaAsset ────────────────────────────────────────────────────────────────

/** MediaAsset.tags */
export type MediaTags = StringArray;

// ── KnowledgeNode ─────────────────────────────────────────────────────────────

/** KnowledgeNode.dependencies */
export type NodeDependencies = StringArray;
