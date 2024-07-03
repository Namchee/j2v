import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { isAsyncFunction } from "node:util/types";

import type { Config as JestConfig } from "jest";

import { type JEST_FAKE_TIMER_KEYS, VITEST_CONFIG_MAP } from "./constant/config";

const JEST_CONFIG = [
  "jest.config.js",
  "jest.config.ts",
  "jest.config.cjs",
  "jest.config.mjs",
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

  if (existsSync(resolve(process.cwd(), "jest.config.json"))) {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), "jest.config.json")).toString(),
    );
  }

  const packageJson = JSON.parse(
    readFileSync(resolve(process.cwd(), "package.json")).toString(),
  );
  if ("jest" in packageJson) {
    return packageJson.jest;
  }

  return {};
}

const CONFIG_HANDLER = {
  coverageThreshold: convertJestCoverageThresholdToVitest,
  fakeTimers: convertJestTimerConfigToVitest,
};

function convertJestCoverageThresholdToVitest(
  threshold: Record<string, Record<string, number>>,
) {
  return {
    ...threshold.global,
    ...threshold,
  };
}

function convertJestTimerConfigToVitest(
  timers: Record<JEST_FAKE_TIMER_KEYS, unknown>,
) {
  // https://jestjs.io/docs/jest-object#fake-timers
  const mockedByJest = [
    "Date",
    "hrtime",
    "nextTick",
    "performance",
    "queueMicrotask",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "requestIdleCallback",
    "cancelIdleCallback",
    "setImmediate",
    "clearImmediate",
    "setInterval",
    "clearInterval",
    "setTimeout",
    "clearTimeout",
  ];

  return {
    shouldAdvanceTime: Boolean(timers.advanceTimers),
    advanceTimeDelta: Number.isNaN(Number(timers.advanceTimers))
      ? undefined
      : timers.advanceTimers,
    toFake: timers.doNotFake
      ? mockedByJest.filter(
          (method) => !(timers.doNotFake as string[]).includes(method),
        )
      : undefined,
    now: timers.now,
  };
}

export function transformJestConfigToVitestConfig(jestConfig: JestConfig): string {
  const mapValue = (target: string | object) => {
    if (typeof target === 'object') {
      const acc: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(target)) {
        acc[key] = mapValue(val);
      }

      return acc;
    }

    return jestConfig[target as keyof JestConfig];
  };

  const vitestConfig: Record<string, unknown> = {};
  for (const [key, target] of Object.entries(VITEST_CONFIG_MAP)) {
    vitestConfig[key] = mapValue(target as string | object);
  }

  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: ${JSON.stringify(vitestConfig)}
});
`;
};
