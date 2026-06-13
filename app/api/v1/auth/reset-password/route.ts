import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { passwordFingerprint, verifyActionToken } from "@/lib/auth/action-tokens";
import { hashPassword } from "@/lib/auth/password";
import { OkResponseSchema, ResetPasswordSchema } from "@/lib/contracts/account";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/reset-password — set a new password from a reset token.
 * The token is single-use: it is bound to the password hash at issue time, so
 * it stops working once the password changes. Public.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const { token, password } = await parseBody(request, ResetPasswordSchema);

  const verified = await verifyActionToken(token, "pwreset");
  if (!verified) {
    throw Errors.validation("Invalid or expired reset token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { id: true, passwordHash: true },
  });
  if (!user || verified.claims.pwh !== passwordFingerprint(user.passwordHash)) {
    throw Errors.validation("Invalid or expired reset token.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });

  return respond(OkResponseSchema, { ok: true });
});
