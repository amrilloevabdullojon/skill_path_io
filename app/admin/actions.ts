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
  TrackStatus,
  UserRole,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminPermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// ─── Audit log helper ─────────────────────────────────────────────────────────
// Logs admin activity to AdminActivityLog. Never throws — logging failures must
// not interrupt the main action.
async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  details?: string,
) {
  try {
    const session = await getServerSession(authOptions);
    const actorEmail =
      typeof session?.user?.email === "string"
        ? session.user.email
        : "unknown@admin";

    let actorRole: PermissionRoleType = PermissionRoleType.COURSE_EDITOR;
    try {
      const dbRole = await prisma.permissionRole.findUnique({
        where: { email: actorEmail },
        select: { role: true, isActive: true },
      });
      if (dbRole?.isActive) {
        actorRole = dbRole.role;
      }
    } catch {
      // keep default role if DB lookup fails
    }

    await prisma.adminActivityLog.create({
      data: {
        actorEmail,
        actorRole,
        action,
        entityType,
        entityId,
        note: details ?? "",
      },
    });
  } catch {
    // logging must never break the main action
  }
}

// ─── Role permissions reference ───────────────────────────────────────────────
// NOTE: This constant is a fallback/seed reference only — it is NOT the source
// of truth. The authoritative permissions live in the DB `PermissionRole` table.
// Do not use this constant for runtime permission checks; use requireAdminPermission instead.
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

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const raw = stringValue(formData, key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

// Parses a newline-separated string into a deduplicated, trimmed array of non-empty strings.
function parseStringList(raw: string): string[] {
  return [...new Set(
    raw.split("\n")
       .map((s) => s.trim())
       .filter(Boolean),
  )];
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

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[updateUserAction]", err);
  }
}

export async function updateTrackAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const color = stringValue(formData, "color");
  const category = stringValue(formData, "category");
  const status = stringValue(formData, "status");
  const estimatedWeeksRaw = numberValue(formData, "estimatedWeeks");
  const skillsRaw = stringValue(formData, "skills_raw");
  const outcomesRaw = stringValue(formData, "outcomes_raw");
  const careerImpact = stringValue(formData, "careerImpact") || null;

  if (!trackId || !title || !description || !color) {
    return;
  }

  if (!Object.values(TrackCategory).includes(category as TrackCategory)) {
    return;
  }

  if (status && !Object.values(TrackStatus).includes(status as TrackStatus)) {
    return;
  }

  if (color && !/^#[0-9a-fA-F]{3,6}$/.test(color)) {
    return;
  }

  const skills = skillsRaw ? parseStringList(skillsRaw) : undefined;
  const learningOutcomes = outcomesRaw ? parseStringList(outcomesRaw) : undefined;
  const estimatedWeeks =
    estimatedWeeksRaw !== null && estimatedWeeksRaw >= 1 && estimatedWeeksRaw <= 52
      ? estimatedWeeksRaw
      : undefined;

  try {
    await prisma.track.update({
      where: { id: trackId },
      data: {
        title,
        description,
        color,
        category: category as TrackCategory,
        ...(status ? { status: status as TrackStatus } : {}),
        ...(estimatedWeeks !== undefined ? { estimatedWeeks } : {}),
        ...(skills !== undefined ? { skills } : {}),
        ...(learningOutcomes !== undefined ? { learningOutcomes } : {}),
        ...(careerImpact !== null ? { careerImpact } : {}),
      },
    });

    await logActivity("track.update", "Track", trackId, title);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[updateTrackAction]", err);
  }
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

  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { title, description, duration, order },
    });

    await logActivity("UPDATE", "Module", moduleId, title);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[updateModuleAction]", err);
  }
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

  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { title, description, duration, order },
    });

    await logActivity("UPDATE", "Module", moduleId, title);
    revalidatePath("/admin/modules");
    revalidatePath(`/admin/modules/${moduleId}`);
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[updateModuleDetailAction]", err);
  }
}

export async function reorderModulesAction(
  updates: { id: string; order: number }[],
) {
  await requireAdminPermission("courses.write");
  if (!updates.length) return;

  try {
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.module.update({ where: { id }, data: { order } }),
      ),
    );

    await logActivity("REORDER", "Module", updates.map((u) => u.id).join(","), `${updates.length} modules`);
    revalidatePath("/admin/modules");
  } catch (err) {
    console.error("[reorderModulesAction]", err);
  }
}

export async function bulkDeleteModulesAction(moduleIds: string[]) {
  await requireAdminPermission("courses.write");
  if (!moduleIds.length) return;

  try {
    await prisma.module.deleteMany({ where: { id: { in: moduleIds } } });

    await logActivity("BULK_DELETE", "Module", moduleIds.join(","), `${moduleIds.length} modules`);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[bulkDeleteModulesAction]", err);
  }
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

  try {
    const newModule = await prisma.module.create({
      data: {
        trackId,
        title,
        description,
        duration,
        order,
        content: {},
      },
    });

    await logActivity("CREATE", "Module", newModule.id, title);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[createModuleAction]", err);
  }
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return;

  try {
    await prisma.module.delete({ where: { id: moduleId } });

    await logActivity("module.delete", "Module", moduleId);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[deleteModuleAction]", err);
  }
}

export async function duplicateModuleAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return;

  try {
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

    const duplicated = await prisma.module.create({
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

    await logActivity("CREATE", "Module", duplicated.id, `Duplicated from ${moduleId}`);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[duplicateModuleAction]", err);
  }
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

  try {
    const newLesson = await prisma.lesson.create({
      data: { moduleId, title, body, type: type as LessonType, order },
    });

    await logActivity("lesson.create", "Lesson", newLesson.id, title);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${moduleId}`);
  } catch (err) {
    console.error("[createLessonAction]", err);
  }
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

  try {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title, body, type: type as LessonType, order },
      select: { moduleId: true },
    });

    await logActivity("UPDATE", "Lesson", lessonId, title);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${lesson.moduleId}`);
  } catch (err) {
    console.error("[updateLessonAction]", err);
  }
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const lessonId = stringValue(formData, "lessonId");
  if (!lessonId) return;

  try {
    const lesson = await prisma.lesson.delete({
      where: { id: lessonId },
      select: { moduleId: true },
    });

    await logActivity("lesson.delete", "Lesson", lessonId);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${lesson.moduleId}`);
  } catch (err) {
    console.error("[deleteLessonAction]", err);
  }
}

export async function bulkDeleteLessonsAction(lessonIds: string[]) {
  await requireAdminPermission("courses.write");
  if (!lessonIds.length) return;

  try {
    await prisma.lesson.deleteMany({ where: { id: { in: lessonIds } } });

    await logActivity("BULK_DELETE", "Lesson", lessonIds.join(","), `${lessonIds.length} lessons`);
    revalidatePath("/admin/lessons");
  } catch (err) {
    console.error("[bulkDeleteLessonsAction]", err);
  }
}

// ─── Quiz actions ─────────────────────────────────────────────────────────────

export async function createQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!moduleId || !title || passingScore === null) return;

  try {
    const newQuiz = await prisma.quiz.create({ data: { moduleId, title, passingScore } });

    await logActivity("CREATE", "Quiz", newQuiz.id, title);
    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/modules/${moduleId}`);
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[createQuizAction]", err);
  }
}

export async function updateQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!quizId || !title || passingScore === null) return;

  try {
    await prisma.quiz.update({ where: { id: quizId }, data: { title, passingScore } });

    await logActivity("UPDATE", "Quiz", quizId, title);
    revalidatePath("/admin/quizzes");
  } catch (err) {
    console.error("[updateQuizAction]", err);
  }
}

export async function deleteQuizAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  if (!quizId) return;

  try {
    const quiz = await prisma.quiz.delete({
      where: { id: quizId },
      select: { moduleId: true },
    });

    await logActivity("DELETE", "Quiz", quizId);
    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/modules/${quiz.moduleId}`);
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[deleteQuizAction]", err);
  }
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

  try {
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
  } catch (err) {
    console.error("[createQuestionAction]", err);
  }
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

  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { text, type: type as QuestionType, options, correctAnswer: correct },
      select: { quizId: true },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${question.quizId}`);
  } catch (err) {
    console.error("[updateQuestionAction]", err);
  }
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const questionId = stringValue(formData, "questionId");
  if (!questionId) return;

  try {
    const question = await prisma.question.delete({
      where: { id: questionId },
      select: { quizId: true },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${question.quizId}`);
  } catch (err) {
    console.error("[deleteQuestionAction]", err);
  }
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
  const status = stringValue(formData, "status") || TrackStatus.DRAFT;
  const estimatedWeeksRaw = numberValue(formData, "estimatedWeeks");
  const skillsRaw = stringValue(formData, "skills_raw");
  const outcomesRaw = stringValue(formData, "outcomes_raw");
  const careerImpact = stringValue(formData, "careerImpact") || null;

  if (!slug || !title || !description || !icon || !color) return;
  if (!Object.values(TrackCategory).includes(category as TrackCategory)) return;
  if (!Object.values(TrackStatus).includes(status as TrackStatus)) return;

  // Validate slug is URL-safe: lowercase letters, numbers, hyphens only
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/tracks/new?error=invalid_slug");
    return;
  }

  if (color && !/^#[0-9a-fA-F]{3,6}$/.test(color)) return;

  const skills = skillsRaw ? parseStringList(skillsRaw) : [];
  const learningOutcomes = outcomesRaw ? parseStringList(outcomesRaw) : [];
  const estimatedWeeks =
    estimatedWeeksRaw !== null && estimatedWeeksRaw >= 1 && estimatedWeeksRaw <= 52
      ? estimatedWeeksRaw
      : null;

  try {
    const newTrack = await prisma.track.create({
      data: {
        slug,
        title,
        description,
        icon,
        color,
        category: category as TrackCategory,
        status: status as TrackStatus,
        ...(estimatedWeeks !== null ? { estimatedWeeks } : {}),
        skills,
        learningOutcomes,
        ...(careerImpact ? { careerImpact } : {}),
      },
    });

    await logActivity("track.create", "Track", newTrack.id, title);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/analytics");
  } catch (err: unknown) {
    const prismaError = err as { code?: string };
    if (prismaError?.code === "P2002") {
      const { redirect } = await import("next/navigation");
      redirect("/admin/tracks/new?error=slug_taken");
    }
    console.error("[createTrackAction]", err);
  }
}

export async function deleteTrackAction(formData: FormData) {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  if (!trackId) return;

  try {
    await prisma.track.delete({ where: { id: trackId } });

    await logActivity("track.delete", "Track", trackId);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
  } catch (err) {
    console.error("[deleteTrackAction]", err);
  }
}

// ─── Permission actions ───────────────────────────────────────────────────────

export async function createPermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const email = stringValue(formData, "email");
  const role = stringValue(formData, "role");
  if (!email || !Object.values(PermissionRoleType).includes(role as PermissionRoleType)) return;

  try {
    const newPerm = await prisma.permissionRole.create({
      data: { email, role: role as PermissionRoleType, permissions: ROLE_PERMISSIONS[role as PermissionRoleType] },
    });
    await logActivity("permission.create", "Permission", newPerm.id, `${email} -> ${role}`);
    revalidatePath("/admin/permissions");
  } catch (err) {
    console.error("[createPermissionAction]", err);
  }
}

export async function updatePermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const permId = stringValue(formData, "permId");
  const role = stringValue(formData, "role");
  const isActive = formData.get("isActive") === "true";
  if (!permId || !Object.values(PermissionRoleType).includes(role as PermissionRoleType)) return;

  try {
    await prisma.permissionRole.update({
      where: { id: permId },
      data: { role: role as PermissionRoleType, isActive, permissions: ROLE_PERMISSIONS[role as PermissionRoleType] },
    });
    await logActivity("UPDATE", "PermissionRole", permId, `${role} isActive=${isActive}`);
    revalidatePath("/admin/permissions");
  } catch (err) {
    console.error("[updatePermissionAction]", err);
  }
}

export async function deletePermissionAction(formData: FormData) {
  await requireAdminPermission("users.manage");
  const permId = stringValue(formData, "permId");
  if (!permId) return;

  try {
    await prisma.permissionRole.delete({ where: { id: permId } });
    await logActivity("permission.delete", "Permission", permId);
    revalidatePath("/admin/permissions");
  } catch (err) {
    console.error("[deletePermissionAction]", err);
  }
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

  try {
    const newAssignment = await prisma.assignment.create({
      data: { moduleId, title, assignmentType: assignmentType as StudioAssignmentType, instructions, maxScore, estimatedTime },
    });
    await logActivity("CREATE", "Assignment", newAssignment.id, title);
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/modules");
  } catch (err) {
    console.error("[createAssignmentAction]", err);
  }
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

  try {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { title, assignmentType: assignmentType as StudioAssignmentType, instructions, expectedOutput, maxScore, estimatedTime, status: status as StudioContentStatus },
    });
    await logActivity("UPDATE", "Assignment", assignmentId, title);
    revalidatePath("/admin/assignments");
  } catch (err) {
    console.error("[updateAssignmentAction]", err);
  }
}

export async function deleteAssignmentAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const assignmentId = stringValue(formData, "assignmentId");
  if (!assignmentId) return;

  try {
    await prisma.assignment.delete({ where: { id: assignmentId } });
    await logActivity("DELETE", "Assignment", assignmentId);
    revalidatePath("/admin/assignments");
  } catch (err) {
    console.error("[deleteAssignmentAction]", err);
  }
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

  try {
    const newSimulation = await prisma.simulation.create({
      data: { moduleId, title, simulationType: simulationType as StudioSimulationType, scenario, difficulty, estimatedTime, xpReward },
    });
    await logActivity("CREATE", "Simulation", newSimulation.id, title);
    revalidatePath("/admin/simulations");
    revalidatePath("/admin/modules");
  } catch (err) {
    console.error("[createSimulationAction]", err);
  }
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

  try {
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { title, simulationType: simulationType as StudioSimulationType, scenario, difficulty, estimatedTime, xpReward, status: status as StudioContentStatus },
    });
    await logActivity("UPDATE", "Simulation", simulationId, title);
    revalidatePath("/admin/simulations");
  } catch (err) {
    console.error("[updateSimulationAction]", err);
  }
}

export async function deleteSimulationAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const simulationId = stringValue(formData, "simulationId");
  if (!simulationId) return;

  try {
    await prisma.simulation.delete({ where: { id: simulationId } });
    await logActivity("DELETE", "Simulation", simulationId);
    revalidatePath("/admin/simulations");
  } catch (err) {
    console.error("[deleteSimulationAction]", err);
  }
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

  try {
    const newCase = await prisma.caseStudy.create({
      data: { moduleId, title, summary, problemStatement, difficulty },
    });
    await logActivity("CREATE", "CaseStudy", newCase.id, title);
    revalidatePath("/admin/cases");
    revalidatePath("/admin/modules");
  } catch (err) {
    console.error("[createCaseAction]", err);
  }
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

  try {
    await prisma.caseStudy.update({
      where: { id: caseId },
      data: { title, summary, problemStatement, expectedApproach, outcome, difficulty, status: status as StudioContentStatus },
    });
    await logActivity("UPDATE", "CaseStudy", caseId, title);
    revalidatePath("/admin/cases");
  } catch (err) {
    console.error("[updateCaseAction]", err);
  }
}

export async function deleteCaseAction(formData: FormData) {
  await requireAdminPermission("courses.write");
  const caseId = stringValue(formData, "caseId");
  if (!caseId) return;

  try {
    await prisma.caseStudy.delete({ where: { id: caseId } });
    await logActivity("DELETE", "CaseStudy", caseId);
    revalidatePath("/admin/cases");
  } catch (err) {
    console.error("[deleteCaseAction]", err);
  }
}

// ─── Media actions ────────────────────────────────────────────────────────────

export async function deleteMediaAction(formData: FormData) {
  await requireAdminPermission("media.manage");
  const mediaId = stringValue(formData, "mediaId");
  if (!mediaId) return;

  try {
    await prisma.mediaAsset.delete({ where: { id: mediaId } });
    await logActivity("DELETE", "MediaAsset", mediaId);
    revalidatePath("/admin/media");
  } catch (err) {
    console.error("[deleteMediaAction]", err);
  }
}

export async function createMediaAction(formData: FormData) {
  await requireAdminPermission("media.manage");
  const name = stringValue(formData, "name");
  const type = stringValue(formData, "type") || "document";
  const url = stringValue(formData, "url");
  const sizeKb = numberValue(formData, "sizeKb") ?? 0;
  const uploadedBy = stringValue(formData, "uploadedBy");
  if (!name || !url) return;

  try {
    const newMedia = await prisma.mediaAsset.create({
      data: { name, type, url, sizeKb, uploadedBy },
    });
    await logActivity("CREATE", "MediaAsset", newMedia.id, name);
    revalidatePath("/admin/media");
  } catch (err) {
    console.error("[createMediaAction]", err);
  }
}

// ─── Template actions ─────────────────────────────────────────────────────────

export async function createTemplateAction(formData: FormData) {
  await requireAdminPermission("templates.manage");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const category = stringValue(formData, "category");
  if (!title || !description || !category) return;

  try {
    const newTemplate = await prisma.courseTemplate.create({
      data: { title, description, category },
    });
    await logActivity("CREATE", "CourseTemplate", newTemplate.id, title);
    revalidatePath("/admin/templates");
  } catch (err) {
    console.error("[createTemplateAction]", err);
  }
}

export async function deleteTemplateAction(formData: FormData) {
  await requireAdminPermission("templates.manage");
  const templateId = stringValue(formData, "templateId");
  if (!templateId) return;

  try {
    await prisma.courseTemplate.delete({ where: { id: templateId } });
    await logActivity("DELETE", "CourseTemplate", templateId);
    revalidatePath("/admin/templates");
  } catch (err) {
    console.error("[deleteTemplateAction]", err);
  }
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export async function updateCertificateAction(formData: FormData) {
  await requireAdminPermission("certificates.manage");

  const certificateId = stringValue(formData, "certificateId");
  const certificateUrl = stringValue(formData, "certificateUrl");

  if (!certificateId || !certificateUrl) {
    return;
  }

  try {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        certificateUrl,
      },
    });

    revalidatePath("/admin/certificates");
  } catch (err) {
    console.error("[updateCertificateAction]", err);
  }
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

  try {
    const { writeAdminSettings } = await import("@/lib/admin-settings");
    writeAdminSettings(settings);
    revalidatePath("/admin/settings");
  } catch (err) {
    console.error("[saveAdminSettingsAction]", err);
  }
}
