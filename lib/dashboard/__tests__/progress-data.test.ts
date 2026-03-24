import { describe, expect, it } from "vitest";

import { calculateCurrentStreak, clamp, formatDuration } from "../progress-data";

describe("clamp", () => {
  it("returns value within range unchanged", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to minimum", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps to maximum", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("uses defaults 0-100", () => {
    expect(clamp(200)).toBe(100);
    expect(clamp(-1)).toBe(0);
  });
});

describe("formatDuration", () => {
  it("returns Done for zero or negative", () => {
    expect(formatDuration(0)).toBe("Done");
    expect(formatDuration(-5)).toBe("Done");
  });

  it("formats minutes under 60", () => {
    expect(formatDuration(45)).toBe("~45 min");
  });

  it("formats hours for 60+", () => {
    expect(formatDuration(120)).toBe("~2 h");
    expect(formatDuration(90)).toBe("~1.5 h");
  });
});

describe("calculateCurrentStreak", () => {
  it("returns 0 for empty dates", () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it("returns 1 for a single date", () => {
    expect(calculateCurrentStreak([new Date("2024-01-01")])).toBe(1);
  });

  it("counts consecutive days correctly", () => {
    const dates = [
      new Date("2024-01-01"),
      new Date("2024-01-02"),
      new Date("2024-01-03"),
    ];
    expect(calculateCurrentStreak(dates)).toBe(3);
  });

  it("stops streak at gap", () => {
    const dates = [
      new Date("2024-01-01"),
      new Date("2024-01-02"),
      // gap on Jan 3
      new Date("2024-01-04"),
      new Date("2024-01-05"),
    ];
    // Streak from end: Jan 4-5 = 2
    expect(calculateCurrentStreak(dates)).toBe(2);
  });

  it("deduplicates same-day entries", () => {
    const dates = [
      new Date("2024-01-01T08:00:00"),
      new Date("2024-01-01T20:00:00"),
      new Date("2024-01-02"),
    ];
    expect(calculateCurrentStreak(dates)).toBe(2);
  });
});
