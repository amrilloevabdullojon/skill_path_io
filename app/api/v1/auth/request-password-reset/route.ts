import { withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { OkResponseSchema, RequestPasswordResetSchema } from "@/lib/contracts/account";
import { sendPasswordResetEmail } from "@/lib/email/auth-emails";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/request-password-reset — email a reset link if the account
 * exists. Always responds 200 to avoid account enumeration. Public.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const { email } = await parseBody(request, RequestPasswordResetSchema);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });
  if (user) {
    await sendPasswordResetEmail(user);
  }

  return respond(OkResponseSchema, { ok: true });
});
