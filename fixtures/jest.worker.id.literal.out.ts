import { describe, expect, it } from "vitest";

describe("sample test", () => {
  it("should log the JEST_WORKER_ID", () => {
    // biome-ignore lint/complexity/useLiteralKeys: intended for testing
    const workerId = process.env['VITEST_POOL_ID'];

    if (workerId === "1") {
      expect(true).toBe(true);
    } else {
      expect(true).toBe(false);
    }
  });
});
