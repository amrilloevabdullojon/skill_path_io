import "server-only";

import {
  EMAIL_VERIFY_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
  passwordFingerprint,
  signActionToken,
} from "@/lib/auth/action-tokens";
import { sendEmail } from "@/lib/email/send";
import { env } from "@/lib/env";

function appUrl(path: string): string {
  const base = (env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Issue a password-reset token and email the reset link. */
export async function sendPasswordResetEmail(user: {
  id: string;
  email: string;
  passwordHash: string | null;
}): Promise<void> {
  const token = await signActionToken(user.id, "pwreset", PASSWORD_RESET_TTL_SECONDS, {
    pwh: passwordFingerprint(user.passwordHash),
  });
  const link = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  await sendEmail({
    to: user.email,
    subject: "Reset your Levio password",
    text: `Reset your password using this link (valid 30 minutes):\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
  });
}

/** Issue an email-verification token and email the verification link. */
export async function sendVerificationEmail(user: { id: string; email: string }): Promise<void> {
  const token = await signActionToken(user.id, "emailverify", EMAIL_VERIFY_TTL_SECONDS);
  const link = appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  await sendEmail({
    to: user.email,
    subject: "Verify your Levio email",
    text: `Confirm your email using this link (valid 24 hours):\n\n${link}`,
  });
}
