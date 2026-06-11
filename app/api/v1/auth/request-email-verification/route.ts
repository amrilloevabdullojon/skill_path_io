import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { respond } from "@/lib/api/v1/http";
import { OkResponseSchema } from "@/lib/contracts/account";
import { sendVerificationEmail } from "@/lib/email/auth-emails";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/request-email-verification — resend the verification email
 * for the authenticated user. Protected.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const user = await prisma.user.findUnique({
    where: { id: identity.id },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!user) {
    throw Errors.notFound("User not found");
  }

  if (!user.emailVerified) {
    await sendVerificationEmail(user);
  }

  return respond(OkResponseSchema, { ok: true });
});
