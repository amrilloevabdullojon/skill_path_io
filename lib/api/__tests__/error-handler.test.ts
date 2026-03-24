import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";

import { AppError, Errors, withErrorHandler, apiOk, apiError } from "../error-handler";

describe("AppError", () => {
  it("creates error with correct properties", () => {
    const err = new AppError("VALIDATION_ERROR", "Bad input", 400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Bad input");
    expect(err.status).toBe(400);
    expect(err.name).toBe("AppError");
  });

  it("defaults status to 500", () => {
    const err = new AppError("INTERNAL_ERROR", "oops");
    expect(err.status).toBe(500);
  });
});

describe("Errors helpers", () => {
  it("validation returns 400", () => {
    const e = Errors.validation("bad");
    expect(e.status).toBe(400);
    expect(e.code).toBe("VALIDATION_ERROR");
  });

  it("unauthorized returns 401", () => {
    expect(Errors.unauthorized().status).toBe(401);
  });

  it("forbidden returns 403", () => {
    expect(Errors.forbidden().status).toBe(403);
  });

  it("rateLimited returns 429", () => {
    expect(Errors.rateLimited().status).toBe(429);
  });

  it("aiUnavailable returns 502", () => {
    expect(Errors.aiUnavailable().status).toBe(502);
  });
});

describe("withErrorHandler", () => {
  it("returns handler result when no error thrown", async () => {
    const handler = withErrorHandler(async () => {
      return NextResponse.json({ ok: true }, { status: 200 });
    });

    const res = await handler();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("catches AppError and returns proper JSON", async () => {
    const handler = withErrorHandler(async () => {
      throw Errors.validation("Invalid input");
    });

    const res = await handler();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message).toBe("Invalid input");
  });

  it("catches generic Error and returns 500", async () => {
    const handler = withErrorHandler(async () => {
      throw new Error("Something went wrong");
    });

    const res = await handler();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("UNKNOWN_ERROR");
  });
});

describe("apiOk", () => {
  it("returns 200 with data", async () => {
    const res = apiOk({ value: 42 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.value).toBe(42);
  });

  it("accepts custom status", async () => {
    const res = apiOk({}, 201);
    expect(res.status).toBe(201);
  });
});
