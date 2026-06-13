import { expect, test } from "@playwright/test";

/**
 * Database-independent smoke tests — verify the server boots, serves, and that
 * the auth middleware protects app routes. Deeper flows (login -> learning loop)
 * need a seeded database; add them behind a CI database fixture.
 */

test("health endpoint responds with a status field", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();
  expect(body).toHaveProperty("status");
});

test("the OpenAPI spec is served", async ({ request }) => {
  const response = await request.get("/api/v1/openapi.json");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.openapi).toBe("3.0.0");
  expect(body.info?.title).toBe("Levio API");
});

test("unauthenticated app routes redirect to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
