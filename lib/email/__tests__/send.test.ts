// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "@/lib/email/send";

const originalKey = process.env.RESEND_API_KEY;

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  vi.restoreAllMocks();
});

describe("sendEmail", () => {
  it("falls back to console logging when no API key is set", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    const result = await sendEmail({ to: "a@b.com", subject: "Hi", text: "link here" });
    expect(result).toEqual({ delivered: false, dev: true });
    expect(log).toHaveBeenCalled();
  });

  it("calls the provider when an API key is set", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await sendEmail({ to: "a@b.com", subject: "Hi", text: "body" });
    expect(result).toEqual({ delivered: true, dev: false });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
