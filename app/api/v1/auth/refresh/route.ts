import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { issueTokenPair, verifyRefreshToken } from "@/lib/auth/tokens";
import { RefreshRequestSchema, TokenPairSchema } from "@/lib/contracts/auth";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/refresh — rotate a valid refresh token into a new token pair.
 * Public endpoint (whitelisted in proxy.ts).
 */
export const POST = withErrorHandler(async (request: Request) => {
  const { refreshToken } = await parseBody(request, RefreshRequestSchema);

  const identity = await verifyRefreshToken(refreshToken);
  if (!identity) {
    throw Errors.unauthorized("Invalid or expired refresh token");
  }

  const tokens = await issueTokenPair(identity);
  return respond(TokenPairSchema, tokens);
});
