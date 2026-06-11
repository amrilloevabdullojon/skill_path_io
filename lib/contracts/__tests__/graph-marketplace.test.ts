// @vitest-environment node
import { describe, expect, it } from "vitest";

import { CreateEdgeSchema } from "@/lib/contracts/knowledge-graph";
import { ApplyRequestSchema, RoleApplicationSchema } from "@/lib/contracts/marketplace";

describe("knowledge-graph contract", () => {
  it("applies defaults and rejects self-referencing edges", () => {
    const ok = CreateEdgeSchema.safeParse({ fromNodeId: "a", toNodeId: "b" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.edgeType).toBe("REQUIRES");
      expect(ok.data.weight).toBe(1);
    }
    expect(CreateEdgeSchema.safeParse({ fromNodeId: "a", toNodeId: "a" }).success).toBe(false);
  });
});

describe("marketplace contract", () => {
  it("requires roleId and portfolioUrl", () => {
    expect(ApplyRequestSchema.safeParse({ roleId: "r1", portfolioUrl: "/p/me" }).success).toBe(true);
    expect(ApplyRequestSchema.safeParse({ roleId: "r1" }).success).toBe(false);
  });

  it("validates an application", () => {
    expect(
      RoleApplicationSchema.safeParse({
        id: "app-1",
        roleId: "r1",
        candidateUserId: "u1",
        portfolioUrl: "/p/me",
        createdAt: "2026-01-01T00:00:00.000Z",
        status: "SUBMITTED",
      }).success,
    ).toBe(true);
  });
});
