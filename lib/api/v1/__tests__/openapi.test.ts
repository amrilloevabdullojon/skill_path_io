// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "@/lib/api/v1/openapi";

describe("OpenAPI document", () => {
  const doc = buildOpenApiDocument();

  it("describes the v1 endpoints", () => {
    expect(doc.openapi).toBe("3.0.0");
    expect(doc.info.title).toBe("Levio API");
    expect(Object.keys(doc.paths ?? {})).toEqual(
      expect.arrayContaining([
        "/api/v1/auth/register",
        "/api/v1/auth/request-password-reset",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/verify-email",
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
        "/api/v1/auth/me",
        "/api/v1/me/quiz-attempts",
        "/api/v1/me/push-token",
        "/api/v1/admin/ai-usage",
        "/api/v1/subscriptions",
        "/api/v1/command",
        "/api/v1/reports/weekly",
        "/api/v1/interview",
        "/api/v1/knowledge-graph/edges",
        "/api/v1/marketplace/apply",
        "/api/v1/jobs/match",
        "/api/v1/simulation/ba-review",
        "/api/v1/simulation/bug-review",
        "/api/v1/planner/forecast",
        "/api/v1/tracks",
        "/api/v1/tracks/{slug}",
        "/api/v1/tracks/{slug}/progress",
        "/api/v1/tracks/{slug}/modules/{moduleId}",
        "/api/v1/tracks/{slug}/modules/{moduleId}/quiz/attempts",
        "/api/v1/tracks/{slug}/modules/{moduleId}/missions/{missionId}/submissions",
        "/api/v1/bookmarks",
        "/api/v1/notes",
        "/api/v1/portfolio",
        "/api/v1/portfolio/projects",
      ]),
    );
  });

  it("declares a bearer security scheme", () => {
    expect(doc.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
  });
});
