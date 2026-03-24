"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { ProgressStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";

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

  const moduleItem = await prisma.module.findFirst({
    where: {
      id: moduleId,
      track: {
        slug: trackSlug,
      },
    },
    select: {
      id: true,
    },
  });

  if (!moduleItem) {
    return;
  }

  await prisma.userProgress.upsert({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId: moduleItem.id,
      },
    },
    update: {
      status: ProgressStatus.COMPLETED,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      moduleId: moduleItem.id,
      status: ProgressStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/tracks/${trackSlug}`);
  revalidatePath(`/tracks/${trackSlug}/modules/${moduleId}`);
  revalidatePath("/dashboard");
}
