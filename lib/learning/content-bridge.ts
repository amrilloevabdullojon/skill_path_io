import {
  adaptPrismaCourseToRuntimeCourse,
  adaptStudioEntityToRuntimeCourse,
} from "@/lib/learning/content-adapters";
import { RuntimeCourse } from "@/lib/learning/content-types";
import { CourseStudioEntity } from "@/types/builder/course-builder";
import { UnifiedTrack } from "@/types/learning";

function runtimeToUnifiedTrack(course: RuntimeCourse): UnifiedTrack {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    category: course.category,
    status: course.status,
    modules: course.modules
      .sort((a, b) => a.order - b.order)
      .map((moduleItem) => ({
        id: moduleItem.id,
        trackId: course.id,
        title: moduleItem.title,
        description: moduleItem.description,
        order: moduleItem.order,
        duration: moduleItem.estimatedDuration,
        status: moduleItem.status,
        xpReward: moduleItem.xpReward,
        lessons: moduleItem.lessons
          .sort((a, b) => a.order - b.order)
          .map((lesson) => ({
            id: lesson.id,
            moduleId: lesson.moduleId,
            title: lesson.title,
            description: lesson.description || lesson.body,
            order: lesson.order,
            estimatedDuration: lesson.estimatedDuration,
            status: lesson.status,
            blocks: lesson.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => ({
                id: block.id,
                type: block.type,
                content: block.content,
                order: block.order,
                config: block.config,
              })),
          })),
      })),
  };
}

export function mapStudioCourseToUnifiedTrack(entity: CourseStudioEntity): UnifiedTrack {
  return runtimeToUnifiedTrack(adaptStudioEntityToRuntimeCourse(entity));
}

export type PrismaCourseLike = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  shortDescription?: string;
  category: string;
  level?: string;
  estimatedDuration?: number;
  status?: string;
  visibility?: string;
  tags?: unknown;
  icon?: string;
  themeColor?: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedDuration: number;
    status: string;
    xpReward: number;
    visibility?: string;
    unlockRule?: unknown;
    lessons: Array<{
      id: string;
      moduleId: string;
      title: string;
      description: string;
      order: number;
      estimatedDuration: number;
      status: string;
      blocks: Array<{
        id: string;
        type: string;
        content: string;
        order: number;
        config: unknown;
      }>;
    }>;
    quizzes?: Array<{
      id: string;
      title: string;
      description?: string;
      passingScore: number;
      status?: string;
      questions?: Array<{
        id: string;
        questionText: string;
        questionType: string;
        options: unknown;
        correctAnswer: unknown;
      }>;
    }>;
    assignments?: Array<{
      id: string;
      title: string;
      instructions: string;
      expectedOutput: string;
      maxScore: number;
      status?: string;
      difficulty?: string;
    }>;
    simulations?: Array<{
      id: string;
      title: string;
      description: string;
      simulationType: string;
      xpReward: number;
      difficulty: string;
      status?: string;
    }>;
  }>;
};

export function mapPrismaCourseToUnifiedTrack(course: PrismaCourseLike): UnifiedTrack {
  const runtimeCourse = adaptPrismaCourseToRuntimeCourse({
    id: course.id,
    slug: course.slug,
    title: course.title,
    shortTitle: course.shortTitle ?? course.title,
    description: course.description,
    shortDescription: course.shortDescription ?? course.description,
    category: course.category,
    level: course.level ?? "BEGINNER",
    estimatedDuration: course.estimatedDuration ?? 0,
    status: course.status ?? "DRAFT",
    visibility: course.visibility,
    tags: course.tags,
    icon: course.icon,
    themeColor: course.themeColor,
    modules: course.modules.map((moduleItem) => ({
      id: moduleItem.id,
      title: moduleItem.title,
      description: moduleItem.description,
      order: moduleItem.order,
      estimatedDuration: moduleItem.estimatedDuration,
      status: moduleItem.status,
      visibility: moduleItem.visibility ?? "PUBLIC",
      xpReward: moduleItem.xpReward,
      unlockRule: moduleItem.unlockRule ?? {},
      lessons: moduleItem.lessons,
      quizzes: (moduleItem.quizzes ?? []).map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description ?? "",
        passingScore: quiz.passingScore,
        status: quiz.status ?? "DRAFT",
        questions: (quiz.questions ?? []).map((question) => ({
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      })),
      assignments: (moduleItem.assignments ?? []).map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        instructions: assignment.instructions,
        expectedOutput: assignment.expectedOutput,
        maxScore: assignment.maxScore,
        status: assignment.status ?? "DRAFT",
        difficulty: assignment.difficulty,
      })),
      simulations: (moduleItem.simulations ?? []).map((simulation) => ({
        id: simulation.id,
        title: simulation.title,
        description: simulation.description,
        simulationType: simulation.simulationType,
        xpReward: simulation.xpReward,
        difficulty: simulation.difficulty,
        status: simulation.status ?? "DRAFT",
      })),
    })),
  });

  return runtimeToUnifiedTrack(runtimeCourse);
}
