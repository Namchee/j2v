import { existsSync, readFileSync, } from "node:fs";
import { resolve } from "node:path";

import { isAsyncFunction } from "node:util/types";

import type { Config as JestConfig } from 'jest';
import type { UserConfig } from 'vitest/config';

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

function convertJestCoverageThresholdToVitest() {

}

function convertJestTimerConfigToVitest() {

}

function mapJestConfigToVitest(jestConfig: JestConfig): UserConfig['test']
