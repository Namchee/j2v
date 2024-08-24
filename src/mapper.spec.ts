import { describe, expect, it } from "vitest";

import type { Config as JestConfig } from "jest";

import { transformJestConfigToVitest } from "./mapper";

describe("transformJestConfigToVitest", () => {
  it("should transform complete jest config into vitest", () => {
    const jestConfig: JestConfig = {
      bail: true,
      clearMocks: false,
      cacheDirectory: "./.test_cache",
      collectCoverage: true,
      testTimeout: 5000,
      rootDir: ".",
      maxWorkers: 5,
      ci: true,
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      bail: 1,
      clearMocks: false,
      coverage: {
        enabled: true,
      },
      maxWorkers: 5,
      dir: ".",
      server: {
        deps: {
          cacheDir: "./.test_cache",
        },
      },
      testTimeout: 5000,
    });
  });

  it("should not map unknown keys", () => {
    const jestConfig: JestConfig = {
      ci: true,
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({});
  });

  it("should convert coverageThreshold correctly", () => {
    const jestConfig: JestConfig = {
      coverageThreshold: {
        global: {
          statements: 0.7,
          lines: 0.8,
          functions: 0.1,
        },
        "./src/a.ts": {
          statements: 0.7,
          lines: 0.8,
          functions: 0.1,
        },
      },
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      coverage: {
        thresholds: {
          statements: 0.7,
          lines: 0.8,
          functions: 0.1,

          "./src/a.ts": {
            statements: 0.7,
            lines: 0.8,
            functions: 0.1,
          },
        },
      },
    });
  });

  it("should convert fakeTimers correctly", () => {
    const jestConfig: JestConfig = {
      fakeTimers: {
        advanceTimers: true,
      },
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      fakeTimers: {
        shouldAdvanceTime: true,
      },
    });
  });

  it("should revert list of API to be faked instead", () => {
    const jestConfig: JestConfig = {
      fakeTimers: {
        advanceTimers: true,
        doNotFake: ["Date", "clearImmediate", "clearInterval"],
      },
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      fakeTimers: {
        shouldAdvanceTime: true,
        toFake: expect.not.arrayContaining([
          "Date",
          "clearImmediate",
          "clearInterval",
        ]),
      },
    });
  });

  it("should convert coverageProvider to v8", () => {
    const jestConfig: JestConfig = {
      coverageProvider: "babel",
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      coverage: {
        provider: "v8",
      },
    });
  });

  it("should convert workerThreads options correctly", () => {
    const jestConfig: JestConfig = {
      workerThreads: true,
    };

    const vitestConfig = transformJestConfigToVitest(jestConfig);

    expect(vitestConfig).toStrictEqual({
      pool: 'threads',
    });
  });
});
