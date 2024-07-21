type VitestCLIOption = {
  // Vitest equivalent command. If not present, it will use the exact same command
  command?: string;
  // Value override
  value?: string;
  multi?: boolean;
};

type CLICommand = {
  command: string;
  args: string[];
  flags: Record<string, string[]>;
}

type Flag = {
  flag: string;
  value: string[];
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

function extractFlagValue(token: string): Flag {
  if (token.indexOf('=') !== -1) {
    const [flag, val] = token.split('=');

    return {
      flag: flag as string,
      value: [val as string],
    }
  }

  return {
    flag: token,
    value: [],
  };
}

function separateCommands(command: string): CLICommand {
  const tokens = command.split(/\s+/)
  const cli = tokens.shift();

  const args: string[] = [];
  while (!tokens[0]?.startsWith('-')) {
    args.push(tokens.shift() as string);
  }

  const flags: Record<string, string[]> = {};
  let flag = '';
  const value: string[] = [];

  while (tokens.length) {
    const token = tokens.shift() as string;

    if (token?.startsWith('-')) {
      if (flag.length) {
        flags[flag] = value;
        while (value.length) {
          value.pop();
        }
      }

      const { flag: fl, value: val } = extractFlagValue(token);
      flag = fl;
      value.push(...val);
    } else {
      value.push(token);
    }
  }

  return {
    command: cli as string,
    args,
    flags,
  };
}

function separateMultiValue(key: string, value: string[]) {
  const commands = [];
  const vitestFlag = JEST_CLI_MAP[key] as string;
  const prefix = vitestFlag.length === 1 ? '-' : '--';

  for (const val of value) {
    commands.push(`${prefix}${vitestFlag}=${val}`);
  }

  return commands;
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
