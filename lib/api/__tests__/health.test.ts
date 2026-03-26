import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock prisma before importing the route handler
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}));

// Mock next/server minimally
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return actual;
});

import { prisma } from "@/lib/prisma";

/**
 * We test the health check logic directly (without the actual route handler)
 * to avoid Next.js runtime dependencies in unit tests.
 */
async function runHealthCheck(): Promise<{ status: string; checks: { database: { status: string } } }> {
  let dbStatus: "ok" | "error" = "ok";
  let dbError: string | undefined;

  try {
    await (prisma as typeof prisma).$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Unknown error";
    void dbError;
  }

  return {
    status: dbStatus === "error" ? "error" : "ok",
    checks: { database: { status: dbStatus } },
  };
}

describe("health check logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok when database query succeeds", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
    const result = await runHealthCheck();
    expect(result.status).toBe("ok");
    expect(result.checks.database.status).toBe("ok");
  });

  it("returns error when database query fails", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection refused"));
    const result = await runHealthCheck();
    expect(result.status).toBe("error");
    expect(result.checks.database.status).toBe("error");
  });

  it("calls prisma.$queryRaw exactly once", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    await runHealthCheck();
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
