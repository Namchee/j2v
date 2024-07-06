import { describe, it } from "vitest";

import type { Config as JestConfig } from "jest";
import { transformJestConfigToVitestConfig } from "./config";

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

    console.log(vitestConfig);
  });
});
