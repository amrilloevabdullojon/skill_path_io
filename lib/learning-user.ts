import { prisma } from "@/lib/prisma";

export async function resolveLearningUser(preferredEmail?: string | null) {
  const candidates = [preferredEmail, "student@skillpath.local", "admin@skillpath.local"];

  for (const email of candidates) {
    if (!email) {
      continue;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user;
    }
  }

  return prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
}
