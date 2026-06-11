import { getLocalUserByEmail } from "@/lib/auth/local-users";
import { verifyPassword } from "@/lib/auth/password";
import type { TokenIdentity } from "@/lib/auth/tokens";
import { isDemoModeEnabled } from "@/lib/config/runtime-mode";
import { prisma } from "@/lib/prisma";

/**
 * Verify email/password credentials and return a token identity, or null.
 *
 * Supports two account types:
 * - Demo accounts (only when demo mode is enabled and the demo token "local"
 *   is sent) — preserves the existing local panel behavior.
 * - Real accounts — verifies the bcrypt password hash stored on the user.
 *
 * Used by both the mobile token login and (mirrored in) the NextAuth web flow.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<TokenIdentity | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Demo accounts: the local panel always sends password "local".
  if (isDemoModeEnabled() && password === "local") {
    const localUser = getLocalUserByEmail(normalizedEmail);
    if (localUser) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: localUser.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          return { id: dbUser.id, email: localUser.email, role: dbUser.role };
        }
      } catch {
        // fall back to the seed identity below
      }
      return { id: localUser.id, email: localUser.email, role: localUser.role };
    }
  }

  // Real credential accounts: verify the stored bcrypt hash.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    if (dbUser && (await verifyPassword(password, dbUser.passwordHash))) {
      return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    }
  } catch {
    // DB unavailable — deny.
  }

  return null;
}
