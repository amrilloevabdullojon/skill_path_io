import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin-auth";
import { StudioDashboard } from "@/components/admin/dashboard/studio-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  await requireAdminPermission("courses.read");

  let realStats = {
    users: 0,
    tracks: 0,
    modules: 0,
    lessons: 0,
    quizzes: 0,
    certificates: 0,
  };

  try {
    const [users, tracks, modules, lessons, quizzes, certificates] = await prisma.$transaction([
      prisma.user.count(),
      prisma.track.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.certificate.count(),
    ]);
    realStats = { users, tracks, modules, lessons, quizzes, certificates };
  } catch {
    // Dashboard stays functional in local mock mode when PostgreSQL is temporarily unavailable.
  }

  return <StudioDashboard realStats={realStats} />;
}
