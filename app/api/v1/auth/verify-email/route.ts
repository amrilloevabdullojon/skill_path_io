import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { verifyActionToken } from "@/lib/auth/action-tokens";
import { OkResponseSchema, VerifyEmailSchema } from "@/lib/contracts/account";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/verify-email — confirm an email from a verification token.
 * Public (the token is the credential).
 */
export const POST = withErrorHandler(async (request: Request) => {
  const { token } = await parseBody(request, VerifyEmailSchema);

  const verified = await verifyActionToken(token, "emailverify");
  if (!verified) {
    throw Errors.validation("Invalid or expired verification token.");
  }

  await prisma.user.updateMany({
    where: { id: verified.userId, emailVerified: null },
    data: { emailVerified: new Date() },
  });

  return respond(OkResponseSchema, { ok: true });
});
