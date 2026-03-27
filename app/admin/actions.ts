"use server";

import { revalidatePath } from "next/cache";
import {
  LessonType,
  PermissionRoleType,
  QuestionType,
  StudioAssignmentType,
  StudioContentStatus,
  StudioSimulationType,
  TrackCategory,
  UserRole,
} from "@prisma/client";

// Default permissions per role — kept in sync with requireAdminPermission checks
const ROLE_PERMISSIONS: Record<PermissionRoleType, string[]> = {
  SUPER_ADMIN: [
    "courses.read","courses.write","users.manage","settings.manage",
    "media.manage","certificates.manage","templates.manage","analytics.read","audit.read",
  ],
  CONTENT_ADMIN: ["courses.read","courses.write","media.manage","templates.manage","analytics.read"],
  COURSE_EDITOR: ["courses.read","courses.write"],
  REVIEWER: ["courses.read"],
  ANALYTICS_MANAGER: ["analytics.read","audit.read"],
};

import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const raw = stringValue(formData, key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateUserAction(formData: FormData) {
  await requireAdminPermission("users.manage");

  const userId = stringValue(formData, "userId");
  const name = stringValue(formData, "name");
  const role = stringValue(formData, "role");

  if (!userId || !name) {
    return;
  }

  if (role !== UserRole.ADMIN && role !== UserRole.STUDENT) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/analytics");
}

export async function updateTrackAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const color = stringValue(formData, "color");
  const category = stringValue(formData, "category");

  if (!trackId || !title || !description || !color) {
    return;
  }

  if (!Object.values(TrackCategory).includes(category as TrackCategory)) {
    return;
  }

  await prisma.track.update({
    where: { id: trackId },
    data: {
      title,
      description,
      color,
      category: category as TrackCategory,
    },
  });

  revalidatePath("/admin/tracks");
  revalidatePath("/admin/analytics");
}

export async function updateModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!moduleId || !title || duration === null || order === null) {
    return;
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: { title, description, duration, order },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

export async function updateModuleDetailAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!moduleId || !title || duration === null || order === null) {
    return;
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: { title, description, duration, order },
  });

  revalidatePath("/admin/modules");
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/admin/analytics");
}

export async function reorderModulesAction(
  updates: { id: string; order: number }[],
) {
  await requireAdminPermission("courses.write");
  if (!updates.length) return;

  await prisma.$transaction(
    updates.map(({ id, order }) =>
      prisma.module.update({ where: { id }, data: { order } }),
    ),
  );

  revalidatePath("/admin/modules");
}

export async function bulkDeleteModulesAction(moduleIds: string[]) {
  await requireAdminPermission("courses.write");
  if (!moduleIds.length) return;

  await prisma.module.deleteMany({ where: { id: { in: moduleIds } } });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

export async function createModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!trackId || !title || !description || duration === null || order === null) {
    return;
  }

  await prisma.module.create({
    data: {
      trackId,
      title,
      description,
      duration,
      order,
      content: {},
    },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return;

  await prisma.module.delete({ where: { id: moduleId } });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

export async function duplicateModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!mod) return;

  const maxOrder = await prisma.module.aggregate({
    where: { trackId: mod.trackId },
    _max: { order: true },
  });
  const newOrder = (maxOrder._max.order ?? 0) + 1;

  await prisma.module.create({
    data: {
      trackId: mod.trackId,
      title: `${mod.title} (copy)`,
      description: mod.description,
      duration: mod.duration,
      order: newOrder,
      content: mod.content as object,
      lessons: {
        create: mod.lessons.map((l) => ({
          order: l.order,
          title: l.title,
          body: l.body,
          type: l.type,
        })),
      },
    },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

// ─── Lesson actions ──────────────────────────────────────────────────────────

export async function createLessonAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const body = stringValue(formData, "body");
  const type = stringValue(formData, "type");
  const order = numberValue(formData, "order");

  if (!moduleId || !title || order === null) return;
  if (!Object.values(LessonType).includes(type as LessonType)) return;

  await prisma.lesson.create({
    data: { moduleId, title, body, type: type as LessonType, order },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/modules/${moduleId}`);
}

export async function updateLessonAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const lessonId = stringValue(formData, "lessonId");
  const title = stringValue(formData, "title");
  const body = stringValue(formData, "body");
  const type = stringValue(formData, "type");
  const order = numberValue(formData, "order");

  if (!lessonId || !title || order === null) return;
  if (!Object.values(LessonType).includes(type as LessonType)) return;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, body, type: type as LessonType, order },
    select: { moduleId: true },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/modules/${lesson.moduleId}`);
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const lessonId = stringValue(formData, "lessonId");
  if (!lessonId) return;

  const lesson = await prisma.lesson.delete({
    where: { id: lessonId },
    select: { moduleId: true },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/modules/${lesson.moduleId}`);
}

export async function bulkDeleteLessonsAction(lessonIds: string[]) {
  await requireAdminPermission("courses.write");
  if (!lessonIds.length) return;

  await prisma.lesson.deleteMany({ where: { id: { in: lessonIds } } });

  revalidatePath("/admin/lessons");
}

// ─── Quiz actions ─────────────────────────────────────────────────────────────

export async function createQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!moduleId || !title || passingScore === null) return;

  await prisma.quiz.create({ data: { moduleId, title, passingScore } });

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/admin/analytics");
}

export async function updateQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!quizId || !title || passingScore === null) return;

  await prisma.quiz.update({ where: { id: quizId }, data: { title, passingScore } });

  revalidatePath("/admin/quizzes");
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  if (!quizId) return;

  const quiz = await prisma.quiz.delete({
    where: { id: quizId },
    select: { moduleId: true },
  });

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/modules/${quiz.moduleId}`);
  revalidatePath("/admin/analytics");
}

// ─── Question actions ─────────────────────────────────────────────────────────

export async function createQuestionAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  const text = stringValue(formData, "text");
  const type = stringValue(formData, "type");
  const options = formData.getAll("option").map(String).filter(Boolean);
  const correct = formData.getAll("correct").map(String).filter(Boolean);

  if (!quizId || !text || options.length < 2) return;
  if (!Object.values(QuestionType).includes(type as QuestionType)) return;

  await prisma.question.create({
    data: {
      quizId,
      text,
      type: type as QuestionType,
      options,
      correctAnswer: correct,
    },
  });

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${quizId}`);
}

export async function updateQuestionAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const questionId = stringValue(formData, "questionId");
  const text = stringValue(formData, "text");
  const type = stringValue(formData, "type");
  const options = formData.getAll("option").map(String).filter(Boolean);
  const correct = formData.getAll("correct").map(String).filter(Boolean);

  if (!questionId || !text || options.length < 2) return;
  if (!Object.values(QuestionType).includes(type as QuestionType)) return;

  const question = await prisma.question.update({
    where: { id: questionId },
    data: { text, type: type as QuestionType, options, correctAnswer: correct },
    select: { quizId: true },
  });

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${question.quizId}`);
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const questionId = stringValue(formData, "questionId");
  if (!questionId) return;

  const question = await prisma.question.delete({
    where: { id: questionId },
    select: { quizId: true },
  });

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${question.quizId}`);
}

// ─── Track create / delete ────────────────────────────────────────────────────

export async function createTrackAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const slug = stringValue(formData, "slug");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const icon = stringValue(formData, "icon");
  const color = stringValue(formData, "color");
  const category = stringValue(formData, "category");

  if (!slug || !title || !description || !icon || !color) return;
  if (!Object.values(TrackCategory).includes(category as TrackCategory)) return;

  await prisma.track.create({
    data: { slug, title, description, icon, color, category: category as TrackCategory },
  });

  revalidatePath("/admin/tracks");
  revalidatePath("/admin/analytics");
}

export async function deleteTrackAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  if (!trackId) return;

  await prisma.track.delete({ where: { id: trackId } });

  revalidatePath("/admin/tracks");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

// ─── Permission actions ───────────────────────────────────────────────────────

export async function createPermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const email = stringValue(formData, "email");
  const role = stringValue(formData, "role");
  if (!email || !Object.values(PermissionRoleType).includes(role as PermissionRoleType)) return;
  await prisma.permissionRole.create({
    data: { email, role: role as PermissionRoleType, permissions: ROLE_PERMISSIONS[role as PermissionRoleType] },
  });
  revalidatePath("/admin/permissions");
}

export async function updatePermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const permId = stringValue(formData, "permId");
  const role = stringValue(formData, "role");
  const isActive = formData.get("isActive") === "true";
  if (!permId || !Object.values(PermissionRoleType).includes(role as PermissionRoleType)) return;
  await prisma.permissionRole.update({
    where: { id: permId },
    data: { role: role as PermissionRoleType, isActive, permissions: ROLE_PERMISSIONS[role as PermissionRoleType] },
  });
  revalidatePath("/admin/permissions");
}

export async function deletePermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const permId = stringValue(formData, "permId");
  if (!permId) return;
  await prisma.permissionRole.delete({ where: { id: permId } });
  revalidatePath("/admin/permissions");
}

// ─── Assignment actions ───────────────────────────────────────────────────────

export async function createAssignmentAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const assignmentType = stringValue(formData, "assignmentType");
  const instructions = stringValue(formData, "instructions");
  const maxScore = numberValue(formData, "maxScore") ?? 100;
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  if (!moduleId || !title || !instructions) return;
  if (!Object.values(StudioAssignmentType).includes(assignmentType as StudioAssignmentType)) return;
  await prisma.assignment.create({
    data: { moduleId, title, assignmentType: assignmentType as StudioAssignmentType, instructions, maxScore, estimatedTime },
  });
  revalidatePath("/admin/assignments");
}

export async function updateAssignmentAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const assignmentId = stringValue(formData, "assignmentId");
  const title = stringValue(formData, "title");
  const assignmentType = stringValue(formData, "assignmentType");
  const instructions = stringValue(formData, "instructions");
  const expectedOutput = stringValue(formData, "expectedOutput");
  const maxScore = numberValue(formData, "maxScore") ?? 100;
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const status = stringValue(formData, "status");
  if (!assignmentId || !title || !instructions) return;
  if (!Object.values(StudioAssignmentType).includes(assignmentType as StudioAssignmentType)) return;
  if (!Object.values(StudioContentStatus).includes(status as StudioContentStatus)) return;
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { title, assignmentType: assignmentType as StudioAssignmentType, instructions, expectedOutput, maxScore, estimatedTime, status: status as StudioContentStatus },
  });
  revalidatePath("/admin/assignments");
}

export async function deleteAssignmentAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const assignmentId = stringValue(formData, "assignmentId");
  if (!assignmentId) return;
  await prisma.assignment.delete({ where: { id: assignmentId } });
  revalidatePath("/admin/assignments");
}

// ─── Simulation actions ───────────────────────────────────────────────────────

export async function createSimulationAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const simulationType = stringValue(formData, "simulationType");
  const scenario = stringValue(formData, "scenario");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const xpReward = numberValue(formData, "xpReward") ?? 0;
  if (!moduleId || !title || !scenario) return;
  if (!Object.values(StudioSimulationType).includes(simulationType as StudioSimulationType)) return;
  await prisma.simulation.create({
    data: { moduleId, title, simulationType: simulationType as StudioSimulationType, scenario, difficulty, estimatedTime, xpReward },
  });
  revalidatePath("/admin/simulations");
}

export async function updateSimulationAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const simulationId = stringValue(formData, "simulationId");
  const title = stringValue(formData, "title");
  const simulationType = stringValue(formData, "simulationType");
  const scenario = stringValue(formData, "scenario");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const xpReward = numberValue(formData, "xpReward") ?? 0;
  const status = stringValue(formData, "status");
  if (!simulationId || !title || !scenario) return;
  if (!Object.values(StudioSimulationType).includes(simulationType as StudioSimulationType)) return;
  if (!Object.values(StudioContentStatus).includes(status as StudioContentStatus)) return;
  await prisma.simulation.update({
    where: { id: simulationId },
    data: { title, simulationType: simulationType as StudioSimulationType, scenario, difficulty, estimatedTime, xpReward, status: status as StudioContentStatus },
  });
  revalidatePath("/admin/simulations");
}

export async function deleteSimulationAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const simulationId = stringValue(formData, "simulationId");
  if (!simulationId) return;
  await prisma.simulation.delete({ where: { id: simulationId } });
  revalidatePath("/admin/simulations");
}

// ─── Case study actions ───────────────────────────────────────────────────────

export async function createCaseAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const summary = stringValue(formData, "summary");
  const problemStatement = stringValue(formData, "problemStatement");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  if (!moduleId || !title || !problemStatement) return;
  await prisma.caseStudy.create({
    data: { moduleId, title, summary, problemStatement, difficulty },
  });
  revalidatePath("/admin/cases");
}

export async function updateCaseAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const caseId = stringValue(formData, "caseId");
  const title = stringValue(formData, "title");
  const summary = stringValue(formData, "summary");
  const problemStatement = stringValue(formData, "problemStatement");
  const expectedApproach = stringValue(formData, "expectedApproach");
  const outcome = stringValue(formData, "outcome");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const status = stringValue(formData, "status");
  if (!caseId || !title || !problemStatement) return;
  if (!Object.values(StudioContentStatus).includes(status as StudioContentStatus)) return;
  await prisma.caseStudy.update({
    where: { id: caseId },
    data: { title, summary, problemStatement, expectedApproach, outcome, difficulty, status: status as StudioContentStatus },
  });
  revalidatePath("/admin/cases");
}

export async function deleteCaseAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const caseId = stringValue(formData, "caseId");
  if (!caseId) return;
  await prisma.caseStudy.delete({ where: { id: caseId } });
  revalidatePath("/admin/cases");
}

// ─── Media actions ────────────────────────────────────────────────────────────

export async function deleteMediaAction(formData: FormData) {
  await requireAdminPermission("media.manage");
  const mediaId = stringValue(formData, "mediaId");
  if (!mediaId) return;
  await prisma.mediaAsset.delete({ where: { id: mediaId } });
  revalidatePath("/admin/media");
}

export async function createMediaAction(formData: FormData) {
  await requireAdminPermission("media.manage");
  const name = stringValue(formData, "name");
  const type = stringValue(formData, "type") || "document";
  const url = stringValue(formData, "url");
  const sizeKb = numberValue(formData, "sizeKb") ?? 0;
  const uploadedBy = stringValue(formData, "uploadedBy");
  if (!name || !url) return;
  await prisma.mediaAsset.create({
    data: { name, type, url, sizeKb, uploadedBy },
  });
  revalidatePath("/admin/media");
}

// ─── Template actions ─────────────────────────────────────────────────────────

export async function createTemplateAction(formData: FormData) {
  await requireAdminPermission("templates.manage");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const category = stringValue(formData, "category");
  if (!title || !description || !category) return;
  await prisma.courseTemplate.create({
    data: { title, description, category },
  });
  revalidatePath("/admin/templates");
}

export async function deleteTemplateAction(formData: FormData) {
  await requireAdminPermission("templates.manage");
  const templateId = stringValue(formData, "templateId");
  if (!templateId) return;
  await prisma.courseTemplate.delete({ where: { id: templateId } });
  revalidatePath("/admin/templates");
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export async function updateCertificateAction(formData: FormData) {
  await requireAdminPermission("certificates.manage");

  const certificateId = stringValue(formData, "certificateId");
  const certificateUrl = stringValue(formData, "certificateUrl");

  if (!certificateId || !certificateUrl) {
    return;
  }

  await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      certificateUrl,
    },
  });

  revalidatePath("/admin/certificates");
}

// ─── Settings actions ─────────────────────────────────────────────────────────

export async function saveAdminSettingsAction(formData: FormData) {
  await requireAdminPermission("settings.manage");
  const settings: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (
      key === "maintenanceMode" ||
      key === "allowRegistration" ||
      key === "requireEmailVerification" ||
      key === "analyticsEnabled"
    ) {
      settings[key] = value === "true";
    } else if (key === "maxUploadSizeMb") {
      settings[key] = Number(value) || 10;
    } else {
      settings[key] = String(value);
    }
  }
  const { writeAdminSettings } = await import("@/lib/admin-settings");
  writeAdminSettings(settings);
  revalidatePath("/admin/settings");
}
