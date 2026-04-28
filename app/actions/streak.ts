"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function touchUserStreakAction(timezoneOffsetMinutes = 0) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    // Compute midnight in the user's local timezone.
    // getTimezoneOffset() returns minutes WEST of UTC (e.g. UTC+5 → -300),
    // so we subtract the offset to shift the UTC timestamp to local time.
    const nowUtcMs = Date.now();
    const localMs = nowUtcMs - timezoneOffsetMinutes * 60_000;
    const localMidnight = new Date(localMs);
    localMidnight.setUTCHours(0, 0, 0, 0);

    // Shift back to a UTC Date that represents local midnight
    const today = new Date(localMidnight.getTime() + timezoneOffsetMinutes * 60_000);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Upsert or fetch streak
    let streak = await prisma.userStreak.findUnique({
      where: { userId: session.user.id }
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date(),
        }
      });
      return { success: true, streak: streak.currentStreak };
    }

    const lastActivityDate = streak.lastActivityDate;
    
    // Normalize to midnight to avoid time-of-day offsets
    const lastActivityNormalized = lastActivityDate 
      ? new Date(lastActivityDate.setHours(0, 0, 0, 0))
      : null;

    if (!lastActivityNormalized) {
      // First time recording activity
      const updated = await prisma.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, streak.longestStreak),
          lastActivityDate: new Date()
        }
      });
      return { success: true, streak: updated.currentStreak };
    }

    // Already active today
    if (lastActivityNormalized.getTime() === today.getTime()) {
      return { success: true, streak: streak.currentStreak };
    }

    // Active yesterday - increment streak
    if (lastActivityNormalized.getTime() === yesterday.getTime()) {
      const newStreak = streak.currentStreak + 1;
      const updated = await prisma.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastActivityDate: new Date()
        }
      });
      return { success: true, streak: updated.currentStreak };
    }

    // Missed a day or more, reset streak
    const updated = await prisma.userStreak.update({
      where: { id: streak.id },
      data: {
        currentStreak: 1,
        lastActivityDate: new Date()
      }
    });
    
    return { success: true, streak: updated.currentStreak };

  } catch (error) {
    console.error("Streak error:", error);
    return { success: false, streak: 0 };
  }
}
