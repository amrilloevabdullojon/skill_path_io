import "server-only";

import { sendPushToUser } from "@/lib/notifications/push";

/**
 * Product triggers for server-side push.
 *
 * These wrap `sendPushToUser` with consistent copy + deep-link payloads and
 * never throw — a push failure must not break the action that earned it
 * (certificate issuance, etc.). Delivery is best-effort and inert when the
 * user has no registered devices.
 */

/** Notify a learner that they earned a certificate for completing a track/course. */
export async function notifyCertificateEarned(userId: string, trackTitle: string): Promise<void> {
  try {
    await sendPushToUser(userId, {
      title: "Сертификат получен 🎓",
      body: `Вы завершили «${trackTitle}» и получили сертификат.`,
      data: { type: "certificate", href: "/dashboard?tab=skills#xp" },
    });
  } catch {
    // Best-effort: swallow so issuance is never blocked by push delivery.
  }
}

/**
 * Notify a learner they completed a module. Caller should fire this only on the
 * first transition to COMPLETED, and not for the final module of a track (the
 * certificate push covers that), to avoid double-notifying.
 */
export async function notifyModuleCompleted(
  userId: string,
  moduleTitle: string,
  trackSlug: string,
): Promise<void> {
  try {
    await sendPushToUser(userId, {
      title: "Модуль завершён ✅",
      body: `Вы прошли «${moduleTitle}». Так держать!`,
      data: { type: "module", href: `/tracks/${trackSlug}` },
    });
  } catch {
    // Best-effort: never block grading on push delivery.
  }
}
