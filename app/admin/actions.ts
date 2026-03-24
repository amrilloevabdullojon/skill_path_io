"use server";

import { revalidatePath } from "next/cache";
import { TrackCategory, UserRole } from "@prisma/client";

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
  const duration = numberValue(formData, "duration");
  const order = numberValue(formData, "order");

  if (!moduleId || !title || duration === null || order === null) {
    return;
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      title,
      duration,
      order,
    },
  });

  revalidatePath("/admin/modules");
  revalidatePath("/admin/analytics");
}

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
