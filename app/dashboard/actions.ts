"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { ProgressStatus, UserRole } from "@prisma/client";

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function getSubjectUserId() {
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id;
  const sessionEmail = session?.user?.email?.trim().toLowerCase();

  if (sessionUserId) {
    const userById = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true },
    });
    if (userById) {
      return userById.id;
    }
  }

  if (sessionEmail) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: sessionEmail },
      select: { id: true },
    });
    if (userByEmail) {
      return userByEmail.id;
    }
  }

  if (isDemoModeEnabled()) {
    const { getServerEnv } = await import("@/lib/config/env");
    const demoEmail = getServerEnv().demoUserEmail;
    if (demoEmail) {
      const demoUser = await prisma.user.findUnique({
        where: { email: demoEmail.trim().toLowerCase() },
        select: { id: true },
      });
      if (demoUser) {
        return demoUser.id;
      }
    }

    const studentUser = await prisma.user.findFirst({
      where: { role: { in: [UserRole.STUDENT, UserRole.PRO_STUDENT] } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (studentUser) {
      return studentUser.id;
    }

    const defaultUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (defaultUser) {
      return defaultUser.id;
    }
  }

  return null;
}

export async function resetStudentProgressAction() {
  const userId = await getSubjectUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    await prisma.$transaction([
      prisma.userProgress.deleteMany({ where: { userId } }),
      prisma.courseModuleProgress.deleteMany({ where: { userId } }),
      prisma.certificate.deleteMany({ where: { userId } }),
      prisma.courseCertificate.deleteMany({ where: { userId } }),
      prisma.missionSubmission.deleteMany({ where: { userId } }),
      prisma.userStreak.deleteMany({ where: { userId } }),
      prisma.dailyChallenge.deleteMany({ where: { userId } }),
      prisma.skillGapSnapshot.deleteMany({ where: { userId } }),
      prisma.readinessScoreSnapshot.deleteMany({ where: { userId } }),
      prisma.learningPlan.deleteMany({ where: { userId } }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/tracks");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to reset student progress:", error);
    return { success: false, error: "Failed to reset progress" };
  }
}

export async function seedInvestorPresentationAction() {
  const userId = await getSubjectUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    let step = "Wiping data";
    try {
      await prisma.$transaction([
        prisma.userProgress.deleteMany({ where: { userId } }),
        prisma.courseModuleProgress.deleteMany({ where: { userId } }),
        prisma.certificate.deleteMany({ where: { userId } }),
        prisma.courseCertificate.deleteMany({ where: { userId } }),
        prisma.missionSubmission.deleteMany({ where: { userId } }),
        prisma.userStreak.deleteMany({ where: { userId } }),
        prisma.dailyChallenge.deleteMany({ where: { userId } }),
        prisma.skillGapSnapshot.deleteMany({ where: { userId } }),
        prisma.readinessScoreSnapshot.deleteMany({ where: { userId } }),
        prisma.learningPlan.deleteMany({ where: { userId } }),
      ]);
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Fetching tracks";
    const tracks = await prisma.track.findMany({ include: { modules: true }, take: 2 });
    const missions = await prisma.learningMission.findMany({ take: 3 });

    if (tracks.length === 0) {
      return { success: false, error: "No tracks found in DB to seed" };
    }

    const today = new Date();
    const primaryTrack = tracks[0];

    step = "Seeding UserProgress (Completed)";
    try {
      const modulesToComplete = primaryTrack.modules.slice(0, 4);
      for (let i = 0; i < modulesToComplete.length; i++) {
        const moduleItem = modulesToComplete[i];
        const completedAt = new Date();
        completedAt.setDate(today.getDate() - (10 - i * 2));

        await prisma.userProgress.create({
          data: {
            userId,
            moduleId: moduleItem.id,
            status: ProgressStatus.COMPLETED,
            score: 85 + (i * 2),
            completedAt,
          }
        });
      }
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Seeding UserProgress (In Progress)";
    try {
      if (primaryTrack.modules.length > 4) {
        await prisma.userProgress.create({
          data: {
            userId,
            moduleId: primaryTrack.modules[4].id,
            status: ProgressStatus.IN_PROGRESS,
            score: null,
            completedAt: null,
          }
        });
      }
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Seeding Certificates";
    try {
      if (tracks.length > 1) {
        await prisma.certificate.create({
          data: {
            userId,
            trackId: tracks[1].id,
            issuedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
            certificateUrl: "/certificates/demo-certificate-url",
          }
        });
      }
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Seeding Missions";
    try {
      for (let i = 0; i < Math.min(2, missions.length); i++) {
          await prisma.missionSubmission.create({
              data: {
                  userId,
                  missionId: missions[i].id,
                  status: "APPROVED",
                  score: 95,
                  feedback: JSON.stringify([{ type: "success", text: "Отличный инвесторский кейс!" }]),
                  answer: "https://github.com/example/demo",
              }
          });
      }
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Seeding UserStreak";
    try {
      await prisma.userStreak.create({
          data: {
              userId,
              currentStreak: 14,
              longestStreak: 21,
              lastActivityDate: today,
          }
      });
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    step = "Seeding DailyChallenge";
    try {
      await prisma.dailyChallenge.create({
          data: {
              userId,
              challengeType: "COMPLETE_LESSON",
              date: today,
              goal: 5,
              progress: 3,
              xpReward: 120,
              isCompleted: false,
          }
      });
    } catch (e) { throw new Error(step + ": " + errMessage(e)); }

    revalidatePath("/dashboard");
    revalidatePath("/tracks");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to seed investor presentation:", error);
    const message = errMessage(error) || "Unknown error";
    return { success: false, error: "DB Error: " + message };
  }
}
