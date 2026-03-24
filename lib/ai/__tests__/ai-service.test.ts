import { describe, expect, it } from "vitest";

import {
  buildInterviewPrompt,
  buildMentorPrompt,
  buildReviewPrompt,
  getClientIp,
} from "../ai-service";

describe("getClientIp", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("uses x-real-ip as fallback", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("returns local when no headers", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("local");
  });
});

describe("buildMentorPrompt", () => {
  it("includes track and module titles", () => {
    const prompt = buildMentorPrompt({
      trackTitle: "QA Engineer",
      moduleTitle: "Test Design",
      lessonText: "Some content",
    });
    expect(prompt).toContain("QA Engineer");
    expect(prompt).toContain("Test Design");
    expect(prompt).toContain("Some content");
  });

  it("uses fallback for missing lesson text", () => {
    const prompt = buildMentorPrompt({
      trackTitle: "QA",
      moduleTitle: "Module",
      lessonText: "",
    });
    expect(prompt).toContain("Lesson context is missing");
  });
});

describe("buildReviewPrompt", () => {
  it("labels quiz type correctly", () => {
    const prompt = buildReviewPrompt({
      type: "quiz",
      topic: "Testing",
      submission: "My answer",
    });
    expect(prompt).toContain("quiz answer");
    expect(prompt).toContain("Testing");
    expect(prompt).toContain("My answer");
  });

  it("labels mission type correctly", () => {
    const prompt = buildReviewPrompt({
      type: "mission",
      topic: "Mission",
      submission: "My answer",
    });
    expect(prompt).toContain("mission submission");
  });

  it("includes criteria when provided", () => {
    const prompt = buildReviewPrompt({
      type: "exercise",
      topic: "SQL",
      submission: "SELECT *",
      criteria: "Must use JOIN",
    });
    expect(prompt).toContain("Must use JOIN");
  });

  it("truncates submission to 3000 chars", () => {
    const longSubmission = "a".repeat(5000);
    const prompt = buildReviewPrompt({
      type: "exercise",
      topic: "Topic",
      submission: longSubmission,
    });
    expect(prompt).toContain("a".repeat(3000));
    expect(prompt).not.toContain("a".repeat(3001));
  });
});

describe("buildInterviewPrompt", () => {
  it("builds start prompt", () => {
    const prompt = buildInterviewPrompt({
      track: "QA",
      role: "QA Engineer",
      action: "start",
    });
    expect(prompt).toContain("QA Engineer");
    expect(prompt).toContain("QA");
  });

  it("builds evaluate prompt with content", () => {
    const prompt = buildInterviewPrompt({
      track: "QA",
      role: "QA Lead",
      action: "evaluate",
      content: "My answer to the question",
    });
    expect(prompt).toContain("My answer");
  });
});
