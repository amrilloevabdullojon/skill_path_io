"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { ProgressStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { resolveRuntimeCourseBySlug } from "@/lib/learning/runtime-content";
import { upsertRuntimeModuleProgress } from "@/lib/learning/progress";
import { resolveLearningUser } from "@/lib/learning-user";

function toStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function markModuleAsCompleted(formData: FormData) {
  const moduleId = toStringValue(formData.get("moduleId"));
  const trackSlug = toStringValue(formData.get("trackSlug"));

  if (!moduleId || !trackSlug) {
    return;
  }

  const session = await getServerSession(authOptions);
  const user = await resolveLearningUser(session?.user?.email);

  if (!user) {
    return;
  }

  const runtimeCourse = await resolveRuntimeCourseBySlug(trackSlug, { includeCourseEntities: true });
  const moduleItem = runtimeCourse?.modules.find((moduleEntry) => moduleEntry.id === moduleId) ?? null;

  if (!runtimeCourse || !moduleItem) {
    return;
  }

  await upsertRuntimeModuleProgress({
    userId: user.id,
    moduleId: moduleItem.id,
    source: runtimeCourse.source,
    status: ProgressStatus.COMPLETED,
    completedAt: new Date(),
  });

  revalidatePath(`/tracks/${trackSlug}`);
  revalidatePath(`/tracks/${trackSlug}/modules/${moduleId}`);
  revalidatePath("/dashboard");
}
