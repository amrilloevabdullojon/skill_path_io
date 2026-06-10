import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { verifyCredentials } from "@/lib/auth/credentials";
import { issueTokenPair } from "@/lib/auth/tokens";
import { LoginRequestSchema, TokenPairSchema } from "@/lib/contracts/auth";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/login — exchange credentials for an access/refresh token pair.
 * Public endpoint (whitelisted in proxy.ts).
 */
export const POST = withErrorHandler(async (request: Request) => {
  const { email, password } = await parseBody(request, LoginRequestSchema);

  const identity = await verifyCredentials(email, password);
  if (!identity) {
    throw Errors.unauthorized("Invalid email or password");
  }

  const tokens = await issueTokenPair(identity);
  return respond(TokenPairSchema, tokens);
});
