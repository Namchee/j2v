import { existsSync, readFileSync, } from "node:fs";
import { resolve } from "node:path";

import { isAsyncFunction } from "node:util/types";

import type { Config as JestConfig } from 'jest';
import type { UserConfig } from 'vitest/config';

import type { JEST_FAKE_TIMER_KEYS } from './constant/config';

const VITEST_TEMPLATE = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {

  },
});
`;

const JEST_CONFIG = [
  'jest.config.js',
  'jest.config.ts',
  'jest.config.cjs',
  'jest.config.mjs',
];



async function getJestConfig(): Promise<JestConfig> {
  for (const config of JEST_CONFIG) {
    if (existsSync(config)) {
      const { default: cfg } = await import(resolve(process.cwd(), config));
      if (isAsyncFunction(cfg)) {
        const realCfg = await cfg();

        return realCfg;
      }

      return cfg;
    }
  }

  if (existsSync(resolve(process.cwd(), 'jest.config.json'))) {
    return JSON.parse(readFileSync(resolve(process.cwd(), 'jest.config.json')).toString());
  }

  const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json')).toString());
  if ('jest' in packageJson) {
    return packageJson.jest;
  }

  return {};
}

const CONFIG_HANDLER = {
  'coverageThreshold': convertJestCoverageThresholdToVitest,
  'fakeTimers': convertJestTimerConfigToVitest
};

function convertJestCoverageThresholdToVitest(threshold: Record<string, Record<string, number> >) {
  return {
    ...threshold.global,
    ...threshold,
  };
}

function convertJestTimerConfigToVitest(timers: Record<JEST_FAKE_TIMER_KEYS, unknown>) {
  return {
    shouldAdvanceTime: Boolean(timers.advanceTimers),
    advanceTimeDelta: Number.isNaN(Number(timers.advanceTimers)) ? undefined : timers.advanceTimers,
    toFake: undefined, // write code here
    now: timers.now,
  }
}

function mapJestConfigToVitest(jestConfig: JestConfig): UserConfig['test']
