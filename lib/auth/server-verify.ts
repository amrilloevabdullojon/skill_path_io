import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Ensures that the current user has a valid session and is an Admin in the database.
 * This mitigates vulnerabilities related to Stale JWT Role tokens.
 */
export async function verifyAdminAccess(): Promise<{ error: string; status: number } | null> {
  const session = await getServerSession(authOptions);
  const email = typeof session?.user?.email === "string" ? session.user.email : null;

  if (!email) {
    return { error: "Unauthorized", status: 401 };
  }

  // Double-verify against the database to prevent stale token bypass
  const requestingUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (requestingUser?.role !== UserRole.ADMIN) {
    return { error: "Forbidden", status: 403 };
  }

  return null; // Authorized
}
