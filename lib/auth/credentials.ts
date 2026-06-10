import { getLocalUserByEmail } from "@/lib/auth/local-users";
import type { TokenIdentity } from "@/lib/auth/tokens";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { prisma } from "@/lib/prisma";

/**
 * Verify email/password credentials and return a token identity, or null.
 *
 * This mirrors the NextAuth credentials `authorize` flow so the mobile token
 * login behaves exactly like the web login:
 * - Demo mode: the local panel sends password "local"; any other value is rejected.
 * - Roles are synced from the DB user when one exists.
 *
 * Phase 0 extension point: when real registration lands, verify a hashed
 * password against the Prisma `User` row here for non-demo deployments.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<TokenIdentity | null> {
  if (!isDemoModeEnabled()) {
    // Real credential verification (hashed passwords) is implemented in Phase 0.
    return null;
  }

  // Demo guard: reject any password other than the expected demo token to
  // avoid account enumeration, matching authOptions.authorize.
  if (password !== "local") {
    return null;
  }

  const localUser = getLocalUserByEmail(email);
  if (!localUser) {
    return null;
  }

  // Prefer the DB user's id/role when present, falling back to the local seed.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: localUser.email },
      select: { id: true, role: true },
    });
    if (dbUser) {
      return { id: dbUser.id, email: localUser.email, role: dbUser.role };
    }
  } catch {
    // DB unavailable — fall back to the local seed identity below.
  }

  return { id: localUser.id, email: localUser.email, role: localUser.role };
}
