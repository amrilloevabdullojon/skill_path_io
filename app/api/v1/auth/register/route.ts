import { Errors, withErrorHandler } from "@/lib/api/error-handler";
import { parseBody, respond } from "@/lib/api/v1/http";
import { registerUser, RegistrationError } from "@/lib/auth/register";
import { issueTokenPair } from "@/lib/auth/tokens";
import { TokenPairSchema } from "@/lib/contracts/auth";
import { RegisterRequestSchema } from "@/lib/contracts/register";
import { sendVerificationEmail } from "@/lib/email/auth-emails";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/register — create a credential account and return tokens.
 * Public endpoint (whitelisted in proxy.ts).
 */
export const POST = withErrorHandler(async (request: Request) => {
  const input = await parseBody(request, RegisterRequestSchema);

  try {
    const identity = await registerUser(input);
    await sendVerificationEmail({ id: identity.id, email: identity.email }).catch(() => {});
    const tokens = await issueTokenPair(identity);
    return respond(TokenPairSchema, tokens);
  } catch (error) {
    if (error instanceof RegistrationError) {
      throw Errors.validation(error.message);
    }
    throw error;
  }
});
