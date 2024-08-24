import type { Config as JestConfig } from "jest";

import type { UserConfig } from "vitest/config";

type AnyObject = Record<string, unknown> | unknown[] | null;
type JEST_FAKE_TIMER_KEYS =
  | "advanceTimers"
  | "doNotFake"
  | "enableGlobally"
  | "legacyFakeTimers"
  | "now"
  | "timerLimit";

const VITEST_CONFIG_MAP: Record<keyof UserConfig["test"], string> = {
  bail: "bail",
  clearMocks: "clearMocks",
  server: {
    deps: {
      cacheDir: "cacheDirectory",
    },
  },
  coverage: {
    enabled: "collectCoverage",
    include: "collectCoverageFrom",
    exclude: "coveragePathIgnorePatterns",
    reportsDirectory: "coverageDirectory",
    thresholds: "coverageThreshold",
    provider: "coverageProvider",
    reporter: "coverageReporters",
  },
  fakeTimers: "fakeTimers",
  maxConcurrency: "maxConcurrency",
  maxWorkers: "maxWorkers",
  sequence: {
    shuffle: {
      files: "randomize",
    },
  },
  root: "rootDir",
  setupFiles: "setupFiles",
  slowTestThreshold: "slowTestThreshold",
  snapshotFormat: "snapshotFormat",
  snapshotSerializers: "snapshotSerializers",
  environment: "testEnvironment",
  include: "testMatch",
  exclude: "testPathIgnorePatterns",
  testTimeout: "testTimeout",
};

const CONFIG_MAPPER: Partial<
  // biome-ignore lint/suspicious/noExplicitAny: type is too varying
  Record<keyof JestConfig, (value: any) => unknown>
> = {
  coverageThreshold: convertJestCoverageThresholdToVitest,
  coverageProvider: convertJestCoverageProviderToVitest,
  fakeTimers: convertJestTimerConfigToVitest,
  bail: convertJestBailConfigToVitest,
};

function removeUndefinedKeys(obj: AnyObject) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const newObj: AnyObject = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = removeUndefinedKeys(obj[key as keyof AnyObject]);

      if (value !== undefined) {
        // biome-ignore lint/suspicious/noExplicitAny: very hard to type this
        (newObj as any)[key] = value;
      }
    }
  }

  if (Object.keys(newObj).length === 0 && !Array.isArray(newObj)) {
    return undefined;
  }

  return newObj;
}

function convertJestCoverageProviderToVitest() {
  return "v8";
}

function convertJestCoverageThresholdToVitest(
  threshold?: Record<string, Record<string, number>>,
): Record<string, unknown> | undefined {
  if (!threshold) {
    return undefined;
  }

  const { global, ...rest } = threshold;
  return {
    ...global,
    ...rest,
  };
}

function convertJestTimerConfigToVitest(
  timers?: Record<JEST_FAKE_TIMER_KEYS, unknown>,
): Record<string, unknown> | undefined {
  if (!timers) {
    return undefined;
  }

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
    advanceTimeDelta:
      typeof timers.advanceTimers === "number"
        ? timers.advanceTimers
        : undefined,
    toFake: timers.doNotFake
      ? mockedByJest.filter(
          (method) => !(timers.doNotFake as string[]).includes(method),
        )
      : undefined,
    now: timers.now,
  };
}

function convertJestBailConfigToVitest(bail: number | boolean): number {
  return typeof bail === 'boolean' ? 1 : bail;
}

export function transformJestConfigToVitest(
  jestConfig: JestConfig,
  useGlobal = false,
): UserConfig["test"] {
  const mapValue = (target: string | object): unknown => {
    if (typeof target === "object") {
      const acc: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(target)) {
        acc[key] = mapValue(val);
      }

      return acc;
    }

    const value = jestConfig[target as keyof JestConfig];
    if (target in CONFIG_MAPPER) {
      const mapper = CONFIG_MAPPER[target as keyof typeof CONFIG_MAPPER];

      return typeof mapper === "function" ? mapper(value) : value;
    }

    return value;
  };

  const vitestConfig: Record<string, unknown> = {};
  const configMap = Object.entries(VITEST_CONFIG_MAP).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  for (const [key, target] of configMap) {
    vitestConfig[key] = mapValue(target as string | object);
  }

  if (useGlobal) {
    vitestConfig.globals = true;
  }

  const cleanedConfig = removeUndefinedKeys(vitestConfig);

  return cleanedConfig ? cleanedConfig as UserConfig["test"] : {};
}
