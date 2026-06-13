// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async () => "hashed-pw"),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { hashPassword } from "@/lib/auth/password";
import { registerUser, RegistrationError } from "@/lib/auth/register";
import { prisma } from "@/lib/prisma";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerUser", () => {
  it("creates a new user with a hashed password and normalized email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u1",
      email: "new@levio.io",
      role: "STUDENT",
    } as never);

    const identity = await registerUser({
      name: "New User",
      email: "  New@Levio.io ",
      password: "password123",
    });

    expect(identity).toEqual({ id: "u1", email: "new@levio.io", role: "STUDENT" });
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "new@levio.io", passwordHash: "hashed-pw" }),
      }),
    );
  });

  it("rejects a duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as never);
    await expect(
      registerUser({ name: "Dup", email: "taken@levio.io", password: "password123" }),
    ).rejects.toBeInstanceOf(RegistrationError);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
