import type { LearnerCourse } from "@/lib/contracts/catalog";
import type { LearnerModule } from "@/lib/contracts/modules";
import type { RuntimeCourse, RuntimeModule } from "@/lib/learning/content-types";

/**
 * Project a runtime module into the learner-facing module DTO.
 * Strips quiz `correctAnswer` values and the internal `content` blob so answers
 * are never exposed to the client.
 */
export function toLearnerModule(module: RuntimeModule): LearnerModule {
  return {
    id: module.id,
    courseId: module.courseId,
    order: module.order,
    title: module.title,
    description: module.description,
    estimatedDuration: module.estimatedDuration,
    xpReward: module.xpReward,
    status: module.status,
    visibility: module.visibility,
    lessons: module.lessons,
    quiz: module.quiz
      ? {
          id: module.quiz.id,
          moduleId: module.quiz.moduleId,
          title: module.quiz.title,
          description: module.quiz.description,
          passingScore: module.quiz.passingScore,
          status: module.quiz.status,
          questionCount: module.quiz.questions.length,
          questions: module.quiz.questions.map((question) => ({
            id: question.id,
            text: question.text,
            type: question.type,
            options: question.options,
          })),
        }
      : null,
    missions: module.missions,
    simulations: module.simulations,
  };
}

/**
 * Project a runtime course into the learner-facing course DTO, stripping quiz
 * answers from every module.
 */
export function toLearnerCourse(course: RuntimeCourse): LearnerCourse {
  return {
    ...course,
    modules: course.modules.map(toLearnerModule),
  };
}
