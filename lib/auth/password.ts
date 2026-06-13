import "server-only";

import bcrypt from "bcryptjs";

/**
 * Password hashing for credential auth. Uses bcrypt with a cost factor of 12.
 * Kept server-only — never import into client or edge bundles.
 */

const SALT_ROUNDS = 12;

/** Minimum password policy enforced at registration. */
export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
