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
import { actionErr, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  moduleBulkDelete,
  moduleCreate,
  moduleDelete,
  moduleDuplicate,
  moduleReorder,
  moduleUpdate,
} from "@/lib/admin/modules/service";
import {
  lessonCreate,
  lessonDelete,
  lessonUpdate,
  lessonBulkDelete,
} from "@/lib/admin/lessons/service";
import {
  quizCreate,
  quizDelete,
  quizUpdate,
  questionCreate,
  questionDelete,
  questionUpdate,
} from "@/lib/admin/quizzes/service";
import {
  trackCreate,
  trackDelete,
  trackUpdate,
} from "@/lib/admin/tracks/service";
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

// ─── FormData helpers ─────────────────────────────────────────────────────────

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

/**
 * Validates that a raw string value belongs to an enum object.
 * Returns the typed value on success, or null if the value is not in the enum.
 * Replaces the repeated `Object.values(X).includes(y as X)` pattern throughout actions.
 */
function validateEnum<T extends string>(
  value: string,
  enumObj: Record<string, T>,
): T | null {
  return (Object.values(enumObj) as string[]).includes(value)
    ? (value as T)
    : null;
}

// ─── User actions ─────────────────────────────────────────────────────────────

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("users.manage");

  const userId = stringValue(formData, "userId");
  const name = stringValue(formData, "name");
  const role = stringValue(formData, "role");

  if (!userId || !name) return actionErr("userId and name are required", "updateUserAction");
  const typedRole = validateEnum(role, UserRole);
  if (!typedRole) return actionErr(`Invalid role: ${role}`, "updateUserAction");

  try {
    await prisma.user.update({ where: { id: userId }, data: { name, role: typedRole } });
    revalidatePath("/admin/users");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[updateUserAction]", err);
    return actionErr("Failed to update user");
  }
}

// ─── Track actions ────────────────────────────────────────────────────────────

export async function updateTrackAction(formData: FormData): Promise<ActionResult> {
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
    return actionErr("trackId, title, description, and color are required", "updateTrackAction");
  }

  const typedCategory = validateEnum(category, TrackCategory);
  if (!typedCategory) return actionErr(`Invalid category: ${category}`, "updateTrackAction");

  const typedStatus = status ? validateEnum(status, TrackStatus) : undefined;
  if (status && !typedStatus) return actionErr(`Invalid status: ${status}`, "updateTrackAction");

  if (!/^#[0-9a-fA-F]{3,6}$/.test(color)) {
    return actionErr("Invalid color format — expected #RRGGBB or #RGB", "updateTrackAction");
  }

  const skills = skillsRaw ? parseStringList(skillsRaw) : undefined;
  const learningOutcomes = outcomesRaw ? parseStringList(outcomesRaw) : undefined;
  const estimatedWeeks =
    estimatedWeeksRaw !== null && estimatedWeeksRaw >= 1 && estimatedWeeksRaw <= 52
      ? estimatedWeeksRaw
      : undefined;

  try {
    await trackUpdate(trackId, {
      title,
      description,
      color,
      category: typedCategory,
      ...(typedStatus ? { status: typedStatus } : {}),
      ...(estimatedWeeks !== undefined ? { estimatedWeeks } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(learningOutcomes !== undefined ? { learningOutcomes } : {}),
      careerImpact,
    });

    await logActivity("track.update", "Track", trackId, title);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[updateTrackAction]", err);
    return actionErr("Failed to update track");
  }
}

// ─── Module actions ───────────────────────────────────────────────────────────

export async function updateModuleAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!moduleId || !title) return actionErr("moduleId and title are required", "updateModuleAction");
  if (duration === null || order === null) return actionErr("duration and order must be valid numbers", "updateModuleAction");

  try {
    await moduleUpdate(moduleId, { title, description, duration, order });

    await logActivity("UPDATE", "Module", moduleId, title);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[updateModuleAction]", err);
    return actionErr("Failed to update module");
  }
}

export async function updateModuleDetailAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!moduleId || !title) return actionErr("moduleId and title are required", "updateModuleDetailAction");
  if (duration === null || order === null) return actionErr("duration and order must be valid numbers", "updateModuleDetailAction");

  try {
    await moduleUpdate(moduleId, { title, description, duration, order });

    await logActivity("UPDATE", "Module", moduleId, title);
    revalidatePath("/admin/modules");
    revalidatePath(`/admin/modules/${moduleId}`);
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[updateModuleDetailAction]", err);
    return actionErr("Failed to update module");
  }
}

export async function reorderModulesAction(
  updates: { id: string; order: number }[],
): Promise<ActionResult> {
  await requireAdminPermission("courses.write");
  if (!updates.length) return actionOk();

  try {
    await moduleReorder(updates);

    await logActivity("REORDER", "Module", updates.map((u) => u.id).join(","), `${updates.length} modules`);
    revalidatePath("/admin/modules");
    return actionOk();
  } catch (err) {
    console.error("[reorderModulesAction]", err);
    return actionErr("Failed to reorder modules");
  }
}

export async function bulkDeleteModulesAction(moduleIds: string[]): Promise<ActionResult> {
  await requireAdminPermission("courses.write");
  if (!moduleIds.length) return actionOk();

  try {
    await moduleBulkDelete(moduleIds);

    await logActivity("BULK_DELETE", "Module", moduleIds.join(","), `${moduleIds.length} modules`);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[bulkDeleteModulesAction]", err);
    return actionErr("Failed to delete modules");
  }
}

export async function createModuleAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!trackId || !title || !description) {
    return actionErr("trackId, title, and description are required", "createModuleAction");
  }
  if (duration === null || order === null) {
    return actionErr("duration and order must be valid numbers", "createModuleAction");
  }

  try {
    const newModule = await moduleCreate({ trackId, title, description, duration, order });

    await logActivity("CREATE", "Module", newModule.id, title);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[createModuleAction]", err);
    return actionErr("Failed to create module");
  }
}

export async function deleteModuleAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return actionErr("moduleId is required", "deleteModuleAction");

  try {
    await moduleDelete(moduleId);

    await logActivity("module.delete", "Module", moduleId);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[deleteModuleAction]", err);
    return actionErr("Failed to delete module");
  }
}

export async function duplicateModuleAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  if (!moduleId) return actionErr("moduleId is required", "duplicateModuleAction");

  try {
    const duplicated = await moduleDuplicate(moduleId);
    if (!duplicated) return actionErr("Module not found", "duplicateModuleAction");

    await logActivity("CREATE", "Module", duplicated.id, `Duplicated from ${moduleId}`);
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[duplicateModuleAction]", err);
    return actionErr("Failed to duplicate module");
  }
}

// ─── Lesson actions ───────────────────────────────────────────────────────────

export async function createLessonAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const body = stringValue(formData, "body");
  const type = stringValue(formData, "type");
  const order = numberValue(formData, "order");

  if (!moduleId || !title) return actionErr("moduleId and title are required", "createLessonAction");
  if (order === null) return actionErr("order must be a valid number", "createLessonAction");
  const typedType = validateEnum(type, LessonType);
  if (!typedType) return actionErr(`Invalid lesson type: ${type}`, "createLessonAction");

  try {
    const newLesson = await lessonCreate({ moduleId, title, body, type: typedType, order });

    await logActivity("lesson.create", "Lesson", newLesson.id, title);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${moduleId}`);
    return actionOk();
  } catch (err) {
    console.error("[createLessonAction]", err);
    return actionErr("Failed to create lesson");
  }
}

export async function updateLessonAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const lessonId = stringValue(formData, "lessonId");
  const title = stringValue(formData, "title");
  const body = stringValue(formData, "body");
  const type = stringValue(formData, "type");
  const order = numberValue(formData, "order");

  if (!lessonId || !title) return actionErr("lessonId and title are required", "updateLessonAction");
  if (order === null) return actionErr("order must be a valid number", "updateLessonAction");
  const typedType = validateEnum(type, LessonType);
  if (!typedType) return actionErr(`Invalid lesson type: ${type}`, "updateLessonAction");

  try {
    const lesson = await lessonUpdate(lessonId, { title, body, type: typedType, order });

    await logActivity("UPDATE", "Lesson", lessonId, title);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${lesson.moduleId}`);
    return actionOk();
  } catch (err) {
    console.error("[updateLessonAction]", err);
    return actionErr("Failed to update lesson");
  }
}

export async function deleteLessonAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const lessonId = stringValue(formData, "lessonId");
  if (!lessonId) return actionErr("lessonId is required", "deleteLessonAction");

  try {
    const lesson = await lessonDelete(lessonId);

    await logActivity("lesson.delete", "Lesson", lessonId);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/modules/${lesson.moduleId}`);
    return actionOk();
  } catch (err) {
    console.error("[deleteLessonAction]", err);
    return actionErr("Failed to delete lesson");
  }
}

export async function bulkDeleteLessonsAction(lessonIds: string[]): Promise<ActionResult> {
  await requireAdminPermission("courses.write");
  if (!lessonIds.length) return actionOk();

  try {
    await lessonBulkDelete(lessonIds);

    await logActivity("BULK_DELETE", "Lesson", lessonIds.join(","), `${lessonIds.length} lessons`);
    revalidatePath("/admin/lessons");
    return actionOk();
  } catch (err) {
    console.error("[bulkDeleteLessonsAction]", err);
    return actionErr("Failed to delete lessons");
  }
}

// ─── Quiz actions ─────────────────────────────────────────────────────────────

export async function createQuizAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!moduleId || !title) return actionErr("moduleId and title are required", "createQuizAction");
  if (passingScore === null) return actionErr("passingScore must be a valid number", "createQuizAction");

  try {
    const newQuiz = await quizCreate({ moduleId, title, passingScore });

    await logActivity("CREATE", "Quiz", newQuiz.id, title);
    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/modules/${moduleId}`);
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[createQuizAction]", err);
    return actionErr("Failed to create quiz");
  }
}

export async function updateQuizAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  const title = stringValue(formData, "title");
  const passingScore = numberValue(formData, "passingScore");

  if (!quizId || !title) return actionErr("quizId and title are required", "updateQuizAction");
  if (passingScore === null) return actionErr("passingScore must be a valid number", "updateQuizAction");

  try {
    await quizUpdate(quizId, { title, passingScore });

    await logActivity("UPDATE", "Quiz", quizId, title);
    revalidatePath("/admin/quizzes");
    return actionOk();
  } catch (err) {
    console.error("[updateQuizAction]", err);
    return actionErr("Failed to update quiz");
  }
}

export async function deleteQuizAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  if (!quizId) return actionErr("quizId is required", "deleteQuizAction");

  try {
    const quiz = await quizDelete(quizId);

    await logActivity("DELETE", "Quiz", quizId);
    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/modules/${quiz.moduleId}`);
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[deleteQuizAction]", err);
    return actionErr("Failed to delete quiz");
  }
}

// ─── Question actions ─────────────────────────────────────────────────────────

export async function createQuestionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const quizId = stringValue(formData, "quizId");
  const text = stringValue(formData, "text");
  const type = stringValue(formData, "type");
  const options = formData.getAll("option").map(String).filter(Boolean);
  const correct = formData.getAll("correct").map(String).filter(Boolean);

  if (!quizId || !text) return actionErr("quizId and text are required", "createQuestionAction");
  if (options.length < 2) return actionErr("At least 2 options are required", "createQuestionAction");
  const typedType = validateEnum(type, QuestionType);
  if (!typedType) return actionErr(`Invalid question type: ${type}`, "createQuestionAction");

  try {
    await questionCreate({ quizId, text, type: typedType, options, correctAnswer: correct });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${quizId}`);
    return actionOk();
  } catch (err) {
    console.error("[createQuestionAction]", err);
    return actionErr("Failed to create question");
  }
}

export async function updateQuestionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const questionId = stringValue(formData, "questionId");
  const text = stringValue(formData, "text");
  const type = stringValue(formData, "type");
  const options = formData.getAll("option").map(String).filter(Boolean);
  const correct = formData.getAll("correct").map(String).filter(Boolean);

  if (!questionId || !text) return actionErr("questionId and text are required", "updateQuestionAction");
  if (options.length < 2) return actionErr("At least 2 options are required", "updateQuestionAction");
  const typedType = validateEnum(type, QuestionType);
  if (!typedType) return actionErr(`Invalid question type: ${type}`, "updateQuestionAction");

  try {
    const question = await questionUpdate(questionId, {
      text,
      type: typedType,
      options,
      correctAnswer: correct,
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${question.quizId}`);
    return actionOk();
  } catch (err) {
    console.error("[updateQuestionAction]", err);
    return actionErr("Failed to update question");
  }
}

export async function deleteQuestionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const questionId = stringValue(formData, "questionId");
  if (!questionId) return actionErr("questionId is required", "deleteQuestionAction");

  try {
    const question = await questionDelete(questionId);

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${question.quizId}`);
    return actionOk();
  } catch (err) {
    console.error("[deleteQuestionAction]", err);
    return actionErr("Failed to delete question");
  }
}

// ─── Track create / delete ────────────────────────────────────────────────────

export async function createTrackAction(formData: FormData): Promise<ActionResult> {
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

  if (!slug || !title || !description || !icon || !color) {
    return actionErr("slug, title, description, icon, and color are required", "createTrackAction");
  }
  const typedCategory = validateEnum(category, TrackCategory);
  if (!typedCategory) return actionErr(`Invalid category: ${category}`, "createTrackAction");
  const typedStatus = validateEnum(status, TrackStatus);
  if (!typedStatus) return actionErr(`Invalid status: ${status}`, "createTrackAction");

  // Validate slug is URL-safe: lowercase letters, numbers, hyphens only.
  // Redirects to form with error query param for user-facing feedback.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/tracks/new?error=invalid_slug");
  }

  if (!/^#[0-9a-fA-F]{3,6}$/.test(color)) {
    return actionErr("Invalid color format — expected #RRGGBB or #RGB", "createTrackAction");
  }

  const skills = skillsRaw ? parseStringList(skillsRaw) : [];
  const learningOutcomes = outcomesRaw ? parseStringList(outcomesRaw) : [];
  const estimatedWeeks =
    estimatedWeeksRaw !== null && estimatedWeeksRaw >= 1 && estimatedWeeksRaw <= 52
      ? estimatedWeeksRaw
      : null;

  try {
    const newTrack = await trackCreate({
      slug,
      title,
      description,
      icon,
      color,
      category: typedCategory,
      status: typedStatus,
      estimatedWeeks: estimatedWeeks ?? null,
      skills,
      learningOutcomes,
      careerImpact,
    });

    await logActivity("track.create", "Track", newTrack.id, title);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err: unknown) {
    const prismaError = err as { code?: string };
    if (prismaError?.code === "P2002") {
      const { redirect } = await import("next/navigation");
      redirect("/admin/tracks/new?error=slug_taken");
    }
    console.error("[createTrackAction]", err);
    return actionErr("Failed to create track");
  }
}

export async function deleteTrackAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const trackId = stringValue(formData, "trackId");
  if (!trackId) return actionErr("trackId is required", "deleteTrackAction");

  try {
    await trackDelete(trackId);

    await logActivity("track.delete", "Track", trackId);
    revalidatePath("/admin/tracks");
    revalidatePath("/admin/modules");
    revalidatePath("/admin/analytics");
    return actionOk();
  } catch (err) {
    console.error("[deleteTrackAction]", err);
    return actionErr("Failed to delete track");
  }
}

// ─── Permission actions ───────────────────────────────────────────────────────

export async function createPermissionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("users.manage");

  const email = stringValue(formData, "email");
  const role = stringValue(formData, "role");

  if (!email) return actionErr("email is required", "createPermissionAction");
  const typedRole = validateEnum(role, PermissionRoleType);
  if (!typedRole) return actionErr(`Invalid role: ${role}`, "createPermissionAction");

  try {
    const newPerm = await prisma.permissionRole.create({
      data: { email, role: typedRole, permissions: ROLE_PERMISSIONS[typedRole] },
    });
    await logActivity("permission.create", "Permission", newPerm.id, `${email} -> ${typedRole}`);
    revalidatePath("/admin/permissions");
    return actionOk();
  } catch (err) {
    console.error("[createPermissionAction]", err);
    return actionErr("Failed to create permission");
  }
}

export async function updatePermissionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("users.manage");

  const permId = stringValue(formData, "permId");
  const role = stringValue(formData, "role");
  const isActive = formData.get("isActive") === "true";

  if (!permId) return actionErr("permId is required", "updatePermissionAction");
  const typedRole = validateEnum(role, PermissionRoleType);
  if (!typedRole) return actionErr(`Invalid role: ${role}`, "updatePermissionAction");

  try {
    await prisma.permissionRole.update({
      where: { id: permId },
      data: { role: typedRole, isActive, permissions: ROLE_PERMISSIONS[typedRole] },
    });
    await logActivity("UPDATE", "PermissionRole", permId, `${typedRole} isActive=${isActive}`);
    revalidatePath("/admin/permissions");
    return actionOk();
  } catch (err) {
    console.error("[updatePermissionAction]", err);
    return actionErr("Failed to update permission");
  }
}

export async function deletePermissionAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("users.manage");

  const permId = stringValue(formData, "permId");
  if (!permId) return actionErr("permId is required", "deletePermissionAction");

  try {
    await prisma.permissionRole.delete({ where: { id: permId } });
    await logActivity("permission.delete", "Permission", permId);
    revalidatePath("/admin/permissions");
    return actionOk();
  } catch (err) {
    console.error("[deletePermissionAction]", err);
    return actionErr("Failed to delete permission");
  }
}

// ─── Assignment actions ───────────────────────────────────────────────────────

export async function createAssignmentAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const assignmentType = stringValue(formData, "assignmentType");
  const instructions = stringValue(formData, "instructions");
  const maxScore = numberValue(formData, "maxScore") ?? 100;
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;

  if (!moduleId || !title || !instructions) {
    return actionErr("moduleId, title, and instructions are required", "createAssignmentAction");
  }
  const typedType = validateEnum(assignmentType, StudioAssignmentType);
  if (!typedType) return actionErr(`Invalid assignment type: ${assignmentType}`, "createAssignmentAction");

  try {
    const newAssignment = await prisma.assignment.create({
      data: { moduleId, title, assignmentType: typedType, instructions, maxScore, estimatedTime },
    });
    await logActivity("CREATE", "Assignment", newAssignment.id, title);
    revalidatePath("/admin/assignments");
    revalidatePath("/admin/modules");
    return actionOk();
  } catch (err) {
    console.error("[createAssignmentAction]", err);
    return actionErr("Failed to create assignment");
  }
}

export async function updateAssignmentAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const assignmentId = stringValue(formData, "assignmentId");
  const title = stringValue(formData, "title");
  const assignmentType = stringValue(formData, "assignmentType");
  const instructions = stringValue(formData, "instructions");
  const expectedOutput = stringValue(formData, "expectedOutput");
  const maxScore = numberValue(formData, "maxScore") ?? 100;
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const status = stringValue(formData, "status");

  if (!assignmentId || !title || !instructions) {
    return actionErr("assignmentId, title, and instructions are required", "updateAssignmentAction");
  }
  const typedType = validateEnum(assignmentType, StudioAssignmentType);
  if (!typedType) return actionErr(`Invalid assignment type: ${assignmentType}`, "updateAssignmentAction");
  const typedStatus = validateEnum(status, StudioContentStatus);
  if (!typedStatus) return actionErr(`Invalid status: ${status}`, "updateAssignmentAction");

  try {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { title, assignmentType: typedType, instructions, expectedOutput, maxScore, estimatedTime, status: typedStatus },
    });
    await logActivity("UPDATE", "Assignment", assignmentId, title);
    revalidatePath("/admin/assignments");
    return actionOk();
  } catch (err) {
    console.error("[updateAssignmentAction]", err);
    return actionErr("Failed to update assignment");
  }
}

export async function deleteAssignmentAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const assignmentId = stringValue(formData, "assignmentId");
  if (!assignmentId) return actionErr("assignmentId is required", "deleteAssignmentAction");

  try {
    await prisma.assignment.delete({ where: { id: assignmentId } });
    await logActivity("DELETE", "Assignment", assignmentId);
    revalidatePath("/admin/assignments");
    return actionOk();
  } catch (err) {
    console.error("[deleteAssignmentAction]", err);
    return actionErr("Failed to delete assignment");
  }
}

// ─── Simulation actions ───────────────────────────────────────────────────────

export async function createSimulationAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const simulationType = stringValue(formData, "simulationType");
  const scenario = stringValue(formData, "scenario");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const xpReward = numberValue(formData, "xpReward") ?? 0;

  if (!moduleId || !title || !scenario) {
    return actionErr("moduleId, title, and scenario are required", "createSimulationAction");
  }
  const typedType = validateEnum(simulationType, StudioSimulationType);
  if (!typedType) return actionErr(`Invalid simulation type: ${simulationType}`, "createSimulationAction");

  try {
    const newSimulation = await prisma.simulation.create({
      data: { moduleId, title, simulationType: typedType, scenario, difficulty, estimatedTime, xpReward },
    });
    await logActivity("CREATE", "Simulation", newSimulation.id, title);
    revalidatePath("/admin/simulations");
    revalidatePath("/admin/modules");
    return actionOk();
  } catch (err) {
    console.error("[createSimulationAction]", err);
    return actionErr("Failed to create simulation");
  }
}

export async function updateSimulationAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const simulationId = stringValue(formData, "simulationId");
  const title = stringValue(formData, "title");
  const simulationType = stringValue(formData, "simulationType");
  const scenario = stringValue(formData, "scenario");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const estimatedTime = numberValue(formData, "estimatedTime") ?? 0;
  const xpReward = numberValue(formData, "xpReward") ?? 0;
  const status = stringValue(formData, "status");

  if (!simulationId || !title || !scenario) {
    return actionErr("simulationId, title, and scenario are required", "updateSimulationAction");
  }
  const typedSimType = validateEnum(simulationType, StudioSimulationType);
  if (!typedSimType) return actionErr(`Invalid simulation type: ${simulationType}`, "updateSimulationAction");
  const typedStatus = validateEnum(status, StudioContentStatus);
  if (!typedStatus) return actionErr(`Invalid status: ${status}`, "updateSimulationAction");

  try {
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { title, simulationType: typedSimType, scenario, difficulty, estimatedTime, xpReward, status: typedStatus },
    });
    await logActivity("UPDATE", "Simulation", simulationId, title);
    revalidatePath("/admin/simulations");
    return actionOk();
  } catch (err) {
    console.error("[updateSimulationAction]", err);
    return actionErr("Failed to update simulation");
  }
}

export async function deleteSimulationAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const simulationId = stringValue(formData, "simulationId");
  if (!simulationId) return actionErr("simulationId is required", "deleteSimulationAction");

  try {
    await prisma.simulation.delete({ where: { id: simulationId } });
    await logActivity("DELETE", "Simulation", simulationId);
    revalidatePath("/admin/simulations");
    return actionOk();
  } catch (err) {
    console.error("[deleteSimulationAction]", err);
    return actionErr("Failed to delete simulation");
  }
}

// ─── Case study actions ───────────────────────────────────────────────────────

export async function createCaseAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const moduleId = stringValue(formData, "moduleId");
  const title = stringValue(formData, "title");
  const summary = stringValue(formData, "summary");
  const problemStatement = stringValue(formData, "problemStatement");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";

  if (!moduleId || !title || !problemStatement) {
    return actionErr("moduleId, title, and problemStatement are required", "createCaseAction");
  }

  try {
    const newCase = await prisma.caseStudy.create({
      data: { moduleId, title, summary, problemStatement, difficulty },
    });
    await logActivity("CREATE", "CaseStudy", newCase.id, title);
    revalidatePath("/admin/cases");
    revalidatePath("/admin/modules");
    return actionOk();
  } catch (err) {
    console.error("[createCaseAction]", err);
    return actionErr("Failed to create case study");
  }
}

export async function updateCaseAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const caseId = stringValue(formData, "caseId");
  const title = stringValue(formData, "title");
  const summary = stringValue(formData, "summary");
  const problemStatement = stringValue(formData, "problemStatement");
  const expectedApproach = stringValue(formData, "expectedApproach");
  const outcome = stringValue(formData, "outcome");
  const difficulty = stringValue(formData, "difficulty") || "MEDIUM";
  const status = stringValue(formData, "status");

  if (!caseId || !title || !problemStatement) {
    return actionErr("caseId, title, and problemStatement are required", "updateCaseAction");
  }
  const typedStatus = validateEnum(status, StudioContentStatus);
  if (!typedStatus) return actionErr(`Invalid status: ${status}`, "updateCaseAction");

  try {
    await prisma.caseStudy.update({
      where: { id: caseId },
      data: { title, summary, problemStatement, expectedApproach, outcome, difficulty, status: typedStatus },
    });
    await logActivity("UPDATE", "CaseStudy", caseId, title);
    revalidatePath("/admin/cases");
    return actionOk();
  } catch (err) {
    console.error("[updateCaseAction]", err);
    return actionErr("Failed to update case study");
  }
}

export async function deleteCaseAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("courses.write");

  const caseId = stringValue(formData, "caseId");
  if (!caseId) return actionErr("caseId is required", "deleteCaseAction");

  try {
    await prisma.caseStudy.delete({ where: { id: caseId } });
    await logActivity("DELETE", "CaseStudy", caseId);
    revalidatePath("/admin/cases");
    return actionOk();
  } catch (err) {
    console.error("[deleteCaseAction]", err);
    return actionErr("Failed to delete case study");
  }
}

// ─── Media actions ────────────────────────────────────────────────────────────

export async function deleteMediaAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("media.manage");

  const mediaId = stringValue(formData, "mediaId");
  if (!mediaId) return actionErr("mediaId is required", "deleteMediaAction");

  try {
    await prisma.mediaAsset.delete({ where: { id: mediaId } });
    await logActivity("DELETE", "MediaAsset", mediaId);
    revalidatePath("/admin/media");
    return actionOk();
  } catch (err) {
    console.error("[deleteMediaAction]", err);
    return actionErr("Failed to delete media asset");
  }
}

export async function createMediaAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("media.manage");

  const name = stringValue(formData, "name");
  const type = stringValue(formData, "type") || "document";
  const url = stringValue(formData, "url");
  const sizeKb = numberValue(formData, "sizeKb") ?? 0;
  const uploadedBy = stringValue(formData, "uploadedBy");

  if (!name || !url) return actionErr("name and url are required", "createMediaAction");

  try {
    const newMedia = await prisma.mediaAsset.create({
      data: { name, type, url, sizeKb, uploadedBy },
    });
    await logActivity("CREATE", "MediaAsset", newMedia.id, name);
    revalidatePath("/admin/media");
    return actionOk();
  } catch (err) {
    console.error("[createMediaAction]", err);
    return actionErr("Failed to create media asset");
  }
}

// ─── Template actions ─────────────────────────────────────────────────────────

export async function createTemplateAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("templates.manage");

  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const category = stringValue(formData, "category");

  if (!title || !description || !category) {
    return actionErr("title, description, and category are required", "createTemplateAction");
  }

  try {
    const newTemplate = await prisma.courseTemplate.create({
      data: { title, description, category },
    });
    await logActivity("CREATE", "CourseTemplate", newTemplate.id, title);
    revalidatePath("/admin/templates");
    return actionOk();
  } catch (err) {
    console.error("[createTemplateAction]", err);
    return actionErr("Failed to create template");
  }
}

export async function deleteTemplateAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("templates.manage");

  const templateId = stringValue(formData, "templateId");
  if (!templateId) return actionErr("templateId is required", "deleteTemplateAction");

  try {
    await prisma.courseTemplate.delete({ where: { id: templateId } });
    await logActivity("DELETE", "CourseTemplate", templateId);
    revalidatePath("/admin/templates");
    return actionOk();
  } catch (err) {
    console.error("[deleteTemplateAction]", err);
    return actionErr("Failed to delete template");
  }
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export async function updateCertificateAction(formData: FormData): Promise<ActionResult> {
  await requireAdminPermission("certificates.manage");

  const certificateId = stringValue(formData, "certificateId");
  const certificateUrl = stringValue(formData, "certificateUrl");

  if (!certificateId || !certificateUrl) {
    return actionErr("certificateId and certificateUrl are required", "updateCertificateAction");
  }

  try {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: { certificateUrl },
    });

    revalidatePath("/admin/certificates");
    return actionOk();
  } catch (err) {
    console.error("[updateCertificateAction]", err);
    return actionErr("Failed to update certificate");
  }
}

// ─── Settings actions ─────────────────────────────────────────────────────────

export async function saveAdminSettingsAction(formData: FormData): Promise<ActionResult> {
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
      const parsed = Number(value);
      // Reject out-of-range values instead of silently defaulting.
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 500) {
        return actionErr("maxUploadSizeMb must be between 1 and 500", "saveAdminSettingsAction");
      }
      settings[key] = parsed;
    } else {
      settings[key] = String(value);
    }
  }

  try {
    const { writeAdminSettings } = await import("@/lib/admin-settings");
    writeAdminSettings(settings);
    revalidatePath("/admin/settings");
    return actionOk();
  } catch (err) {
    console.error("[saveAdminSettingsAction]", err);
    return actionErr("Failed to save settings");
  }
}
