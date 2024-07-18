type VitestCLIOption = {
  // Vitest equivalent command. If not present, it will use the exact same command
  command?: string;
  // Value override
  value?: string;
  multi?: boolean;
};

// Maps Jest CLI options to Vitest
const JEST_CLI_MAP: Record<string, VitestCLIOption> = {
  bail: {},
  changedFilesWithAncestor: {
    command: 'changed',
    value: 'HEAD~1',
  },
  changedSince: {
    command: 'changed',
  },
  config: {},
  c: {},
  coverage: {
    command: 'coverage.enabled',
  },
  collectCoverage: {
    command: 'coverage.enabled',
  },
  coverageDirectory: {
    command: 'coverage.reportsDirectory',
  },
  env: {
    command: 'environment',
  },
  expand: {
    command: 'expandSnapshotDiff',
  },
  injectGlobals: {
    command: 'globals',
  },
  json: {},
  lastCommit: {
    command: 'changed',
    value: 'HEAD~1',
  },
  logHeapUsage: {},
  maxConcurrency: {},
  maxWorkers: {},
  noStackTrace: {
    command: 'printConsoleTrace',
    value: 'false'
  },
  onlyChanged: {
    command: 'changed',
    value: 'HEAD~1'
  },
  outputFile: {},
  passWithNoTests: {},
  randomize: {
    command: 'sequence.shuffle.tests'
  },
  seed: {
    command: 'sequence.seed'
  },
  reporters: {
    command: 'coverage.reporter',
    multi: true,
  },
  roots: {
    command: 'root',
    multi: true,
  },
  runInBand: {
    command: 'sequence.concurrent',
    value: 'false',
  },
  selectProjects: {
    command: 'project',
    multi: true,
  }, // TODO: multi value
  shard: {},
  silent: {},
  testNamePattern: {},
  t: {},
  testPathIgnorePatterns: {
    command: 'exclude',
    multi: true,
  },
  testTimeout: {},
  updateSnaphot: {
    command: 'update',
  },
  watch: {},
};

function isJestCommand(command: string) {
  return command.match(/^.+?jest/);
}

export function createVitestScript(scripts: Record<string, string>) {
  for (const [script, value] of Object.entries(scripts)) {
    const commands = value.split(/\b[&|]+\b/);

    for (const command of commands) {
      if (isJestCommand(command)) {

      }
    }

    scripts[script] = commands.join();
  }
}
