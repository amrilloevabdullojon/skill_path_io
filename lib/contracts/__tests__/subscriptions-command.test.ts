// @vitest-environment node
import { describe, expect, it } from "vitest";

import { CommandResponseSchema } from "@/lib/contracts/command";
import { SubscriptionsResponseSchema } from "@/lib/contracts/subscriptions";

describe("subscriptions contract", () => {
  it("validates a subscription + plans payload", () => {
    const result = SubscriptionsResponseSchema.safeParse({
      subscription: {
        userId: "u1",
        userEmail: "a@b.com",
        planId: "FREE",
        status: "active",
        renewsAt: null,
        source: "mock-local",
      },
      plans: [
        {
          id: "PRO",
          name: "Pro",
          description: "",
          monthlyPriceUsd: 9,
          annualPriceUsd: 90,
          featureBundle: { features: ["ai.mentor"], limits: [] },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown plan id", () => {
    const result = SubscriptionsResponseSchema.safeParse({
      subscription: {
        userId: "u1",
        userEmail: "a@b.com",
        planId: "ULTRA",
        status: "active",
        renewsAt: null,
        source: "mock-local",
      },
      plans: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("command contract", () => {
  it("validates a catalog payload", () => {
    const result = CommandResponseSchema.safeParse({
      tracks: [{ slug: "qa", title: "QA", description: "", modules: [] }],
      missions: [{ id: "m1", title: "M", roleContext: "QA", category: "QA" }],
      jobs: [{ id: "j1", title: "QA", level: "Junior", location: "Remote", roleTrack: "QA" }],
    });
    expect(result.success).toBe(true);
  });
});
