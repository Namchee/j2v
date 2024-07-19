type VitestCLIOption = {
  // Vitest equivalent command. If not present, it will use the exact same command
  command?: string;
  // Value override
  value?: string;
  multi?: boolean;
};

const SEPARATOR_PATTERN = /\s+([&|]+)\s+/gm;

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

function separateCommands(command: string) {
  const tokens = command.split(/\s+/).shift();
}

function isJestCommand(command: string) {
  return command.match(/^.+?jest/);
}

export function createVitestScript(scripts: Record<string, string>) {
  for (const [script, value] of Object.entries(scripts)) {
    const separators = [...value.matchAll(SEPARATOR_PATTERN)].map(val => val[1]);
    const commands = value.split(SEPARATOR_PATTERN);

    for (const command of commands) {
      const trimmedCommand = command.trim();

      if (isJestCommand(trimmedCommand)) {
        const tokens = separateCommands(trimmedCommand);
      }
    }

    scripts[script] = commands.join();
  }
}
