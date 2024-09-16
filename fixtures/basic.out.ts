import { describe, expect, it } from "vitest";

describe("Sample test", () => {
  it("return 2", () => {
    const result = 1 + 1;

    expect(result).toBe(2);
  });

  it("should return `true`", () => {
    const result = 1;
    const assertion = result === 1;

    expect(assertion).toBe(true);
  });
});
