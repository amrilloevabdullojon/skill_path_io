import { describe, it, expect, vi } from "vitest";
import { actionOk, actionErr } from "@/lib/admin/action-result";

describe("actionOk", () => {
  it("returns ok: true with no data by default", () => {
    const result = actionOk();
    expect(result).toEqual({ ok: true, data: undefined });
  });

  it("returns ok: true with provided data", () => {
    const result = actionOk({ id: "123" });
    expect(result).toEqual({ ok: true, data: { id: "123" } });
  });
});

describe("actionErr", () => {
  it("returns ok: false with the error message", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = actionErr("Something went wrong");
    expect(result).toEqual({ ok: false, error: "Something went wrong" });
  });

  it("logs context prefix when provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    actionErr("Bad input", "myAction");
    expect(warnSpy).toHaveBeenCalledWith("[admin action] [myAction] Bad input");
  });

  it("logs without prefix when context is omitted", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    actionErr("Bad input");
    expect(warnSpy).toHaveBeenCalledWith("[admin action] Bad input");
  });
});
