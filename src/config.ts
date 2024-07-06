import type { Config as JestConfig } from "jest";
import type { UserConfig } from "vitest/config";

type AnyObject = Record<string, unknown> | unknown[] | null;
type JEST_FAKE_TIMER_KEYS = 'advanceTimers' | 'doNotFake' | 'enableGlobally' | 'legacyFakeTimers' | 'now' | 'timerLimit';

const VITEST_CONFIG_MAP: Record<keyof UserConfig["test"], unknown> = {
  bail: 'bail',
  clearMocks: 'clearMocks',
  server: {
    deps: {
      cacheDir: 'cacheDirectory',
    }
  },
  coverage: {
    enabled: 'collectCoverage',
    include: 'collectCoverageFrom',
    exclude: 'coveragePathIgnorePatterns',
    reportsDirectory: 'coverageDirectory',
    thresholds: 'coverageThreshold',
  },
  coverageReporters: 'coverageReporters',
  fakeTimers: 'fakeTimers',
  maxConcurrency: 'maxConcurrency',
  maxWorkers: 'maxWorkers',
  sequence: {
    shuffle: {
      files: 'randomize',
    },
  },
  root: 'rootDir',
  setupFiles: 'setupFiles',
  slowTestThreshold: 'slowTestThreshold',
  snapshotFormat: 'snapshotFormat',
  snapshotSerializers: 'snapshotSerializers',
  environment: 'testEnvironment',
  include: 'testMatch',
  exclude: 'testPathIgnorePatterns',
  testTimeout: 'testTimeout',
};


const CONFIG_MAPPER = {
  coverageThreshold: convertJestCoverageThresholdToVitest,
  fakeTimers: convertJestTimerConfigToVitest,
};

function removeUndefinedKeys(obj: AnyObject) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const newObj: AnyObject = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = removeUndefinedKeys(obj[key as keyof AnyObject]);

      if (value !== undefined) {
        newObj[key] = value;
      }
    }
  }

  if (Object.keys(newObj).length === 0 && !Array.isArray(newObj)) {
    return undefined;
  }

  return newObj;
}

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
    if (target as string in CONFIG_MAPPER) {
      return CONFIG_MAPPER[target as keyof typeof CONFIG_MAPPER];
    }

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
  const configMap = Object.entries(VITEST_CONFIG_MAP).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [key, target] of configMap) {
    vitestConfig[key] = mapValue(target as string | object);
  }

  const cleanedConfig = removeUndefinedKeys(vitestConfig);
  const configString = JSON.stringify(cleanedConfig, null, 2).split('\n').map((value, idx) => {
    return idx > 0
      ? `  ${value}`
      : value;
  }).join('\n');

  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: ${configString}
});
`;
};
