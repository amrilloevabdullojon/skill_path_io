// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { ApiError, createApiClient } from "@/lib/api/v1/client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api client", () => {
  it("logs in and parses the token pair", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        accessToken: "a",
        refreshToken: "r",
        tokenType: "Bearer",
        expiresIn: 900,
      }),
    );
    const client = createApiClient({ baseUrl: "https://api.test", fetch: fetchMock });

    const tokens = await client.auth.login({ email: "student@levio.local", password: "local" });

    expect(tokens.accessToken).toBe("a");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "student@levio.local", password: "local" });
  });

  it("attaches a Bearer token and query params on authenticated calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { source: "mixed", courses: [] }));
    const client = createApiClient({
      baseUrl: "https://api.test",
      fetch: fetchMock,
      getAccessToken: () => "access-123",
    });

    await client.tracks.list({ includeDraftCourses: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/tracks?includeDraftCourses=true");
    expect(init.headers.Authorization).toBe("Bearer access-123");
  });

  it("throws ApiError on a non-2xx response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(401, { error: "UNAUTHORIZED", code: "UNAUTHORIZED", message: "nope" }),
    );
    const client = createApiClient({ fetch: fetchMock });

    await expect(client.auth.me()).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHORIZED",
    });
    await expect(client.auth.me()).rejects.toBeInstanceOf(ApiError);
  });
});
