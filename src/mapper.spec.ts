import { describe, expect, it, } from "vitest";

import type { Config as JestConfig } from "jest";

import { transformJestConfigToVitestConfig } from "./mapper";

describe('transformJestConfigToVitest', () => {
  it('should transform complete jest config into vitest', () => {
    const jestConfig: JestConfig = {
      bail: true,
      clearMocks: false,
      cacheDirectory: './.test_cache',
      collectCoverage: true,
      testTimeout: 5000,
      rootDir: '.',
      maxWorkers: 5,
    };

    const vitestConfig = transformJestConfigToVitestConfig(jestConfig);

    expect(vitestConfig).toContain('bail');
    expect(vitestConfig).toContain('clearMocks');
    expect(vitestConfig).toContain('cacheDir');
    expect(vitestConfig).toContain('coverage');
  });

  it('should convert coverageThreshold correctly', () => {
    const jestConfig: JestConfig = {
      coverageThreshold: {
        global: {
          statements: 0.7,
          lines: 0.8,
          functions: 0.1,
        },
        './src/a.ts': {
          statements: 0.7,
          lines: 0.8,
          functions: 0.1,
        },
      }
    };

    const vitestConfig = transformJestConfigToVitestConfig(jestConfig);

    expect(vitestConfig).not.toContain('global');
    expect(vitestConfig).toContain('threshold');
  });

  it('should convert fakeTimers correctly', () => {
    const jestConfig: JestConfig = {
      fakeTimers: {
        advanceTimers: true,
      }
    };

    const vitestConfig = transformJestConfigToVitestConfig(jestConfig);

    expect(vitestConfig).toContain('shouldAdvanceTime');
  });

  it('should revert list of API to be faked instead', () => {
    const jestConfig: JestConfig = {
      fakeTimers: {
        advanceTimers: true,
        doNotFake: ["Date", "clearImmediate", "clearInterval"],
      }
    };

    const vitestConfig = transformJestConfigToVitestConfig(jestConfig);

    expect(vitestConfig).toContain('shouldAdvanceTime');
    expect(vitestConfig).not.toContain('Date');
    expect(vitestConfig).not.toContain('clearImmediate');
    expect(vitestConfig).not.toContain('clearInterval');
  });
});
