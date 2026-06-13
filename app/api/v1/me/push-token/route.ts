import { withErrorHandler } from "@/lib/api/error-handler";
import { requireIdentity } from "@/lib/api/v1/identity";
import { parseBody, respond } from "@/lib/api/v1/http";
import { PushTokenResponseSchema, RegisterPushTokenSchema } from "@/lib/contracts/push";
import { resolveLearningUser } from "@/lib/learning-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/v1/me/push-token — register (or re-assign) an Expo push token for
 * the caller. Idempotent on the token; re-registering moves it to this user.
 */
export const POST = withErrorHandler(async (request: Request) => {
  const identity = await requireIdentity(request);
  const user = await resolveLearningUser(identity.email);
  if (!user) {
    return respond(PushTokenResponseSchema, { ok: false });
  }

  const { token, platform } = await parseBody(request, RegisterPushTokenSchema);

  await prisma.pushToken.upsert({
    where: { token },
    update: { userId: user.id, platform },
    create: { userId: user.id, token, platform },
  });

  return respond(PushTokenResponseSchema, { ok: true });
});
