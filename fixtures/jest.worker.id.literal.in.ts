describe("sample test", () => {
  it("should log the JEST_WORKER_ID", () => {
    // biome-ignore lint/complexity/useLiteralKeys: intended for testing
    const workerId = process.env['JEST_WORKER_ID'];

    if (workerId === "1") {
      expect(true).toBe(true);
    } else {
      expect(true).toBe(false);
    }
  });
});
