import { describe, it, expect } from "vitest";
import { rangesOverlap } from "@/lib/date-range";

describe("rangesOverlap", () => {
  it("detects overlap when new start inside existing", () => {
    expect(rangesOverlap("2026-03-16", "2026-03-18", "2026-03-15", "2026-03-19")).toBe(true);
  });
  it("detects overlap when new end inside existing", () => {
    expect(rangesOverlap("2026-03-14", "2026-03-17", "2026-03-15", "2026-03-19")).toBe(true);
  });
  it("detects full cover overlap", () => {
    expect(rangesOverlap("2026-03-14", "2026-03-20", "2026-03-15", "2026-03-19")).toBe(true);
  });
  it("adjacent ranges [start,end) do not overlap", () => {
    expect(rangesOverlap("2026-03-19", "2026-03-22", "2026-03-15", "2026-03-19")).toBe(false);
    expect(rangesOverlap("2026-03-10", "2026-03-15", "2026-03-15", "2026-03-19")).toBe(false);
  });
  it("non-overlapping ranges", () => {
    expect(rangesOverlap("2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04")).toBe(false);
  });
});
