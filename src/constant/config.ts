export const VITEST_CONFIG_MAP = {
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
    thresholds: 'coverageThreshold', // unpack the global object
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

export type JEST_FAKE_TIMER_KEYS = 'advanceTimers' | 'doNotFake' | 'enableGlobally' | 'legacyFakeTimers' | 'now' | 'timerLimit';
