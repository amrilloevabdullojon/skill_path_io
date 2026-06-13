import "server-only";

import type { RegisterRequest } from "@/lib/contracts/register";
import type { TokenIdentity } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export class RegistrationError extends Error {
  constructor(
    public readonly code: "EMAIL_TAKEN",
    message: string,
  ) {
    super(message);
    this.name = "RegistrationError";
  }
}

/**
 * Create a new credential-based account. Throws RegistrationError("EMAIL_TAKEN")
 * if the email already exists. Returns the created identity.
 */
export async function registerUser(input: RegisterRequest): Promise<TokenIdentity> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new RegistrationError("EMAIL_TAKEN", "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: "STUDENT",
    },
    select: { id: true, email: true, role: true },
  });

  return { id: user.id, email: user.email, role: user.role };
}
