import { parseCLI } from '@namchee/parsley';

type VitestCLIOption = {
  // Vitest equivalent command. If not present, it will use the exact same command
  flag?: string;
  // Value override
  value?: string;
  multi?: boolean;
};

const SEPARATOR_PATTERN = /\s+([&|>]+)\s+/gm;

// Maps Jest CLI options to Vitest
const JEST_CLI_MAP: Record<string, VitestCLIOption> = {
  bail: {},
  changedFilesWithAncestor: {
    flag: 'changed',
    value: 'HEAD~1',
  },
  changedSince: {
    flag: 'changed',
  },
  config: {},
  c: {},
  coverage: {
    flag: 'coverage.enabled',
  },
  collectCoverage: {
    flag: 'coverage.enabled',
  },
  coverageDirectory: {
    flag: 'coverage.reportsDirectory',
  },
  env: {
    flag: 'environment',
  },
  expand: {
    flag: 'expandSnapshotDiff',
  },
  injectGlobals: {
    flag: 'globals',
  },
  json: {},
  lastCommit: {
    flag: 'changed',
    value: 'HEAD~1',
  },
  logHeapUsage: {},
  maxConcurrency: {},
  maxWorkers: {},
  noStackTrace: {
    flag: 'printConsoleTrace',
    value: 'false'
  },
  onlyChanged: {
    flag: 'changed',
    value: 'HEAD~1'
  },
  outputFile: {},
  passWithNoTests: {},
  randomize: {
    flag: 'sequence.shuffle.tests'
  },
  seed: {
    flag: 'sequence.seed'
  },
  reporters: {
    flag: 'coverage.reporter',
    multi: true,
  },
  roots: {
    flag: 'root',
    multi: true,
  },
  runInBand: {
    flag: 'sequence.concurrent',
    value: 'false',
  },
  selectProjects: {
    flag: 'project',
    multi: true,
  },
  shard: {},
  silent: {},
  testNamePattern: {},
  t: {},
  testPathIgnorePatterns: {
    flag: 'exclude',
    multi: true,
  },
  testTimeout: {},
  updateSnaphot: {
    flag: 'update',
  },
  watch: {},
};

function separateMultiValue(key: string, value: string[]): string {
  const commands = [];
  const vitestCLI = JEST_CLI_MAP[key] as VitestCLIOption;
  const newFlag = vitestCLI.flag ?? key;

  const prefix = newFlag.length === 1 ? '-' : '--';

  for (const val of value) {
    commands.push(`${prefix}${newFlag} ${val}`);
  }

  return commands.join(' ');
}

function extractFlag(flag: string, value: string[]): string[] {
  const newFlags = [];

  const prefix = flag.length === 1 ? '-' : '--';

  if (value.length) {
    for (const val of value) {
      newFlags.push(`${prefix}${flag} ${val}`);
    }
  } else {
    newFlags.push(`${prefix}${flag}`);
  }

  return newFlags;
}

function isJestCommand(command: string) {
  return command.match(/^.*jest/);
}

function convertCommandToVitestScript(command: string): string {
  const newFlags: string[] = [];
  const { args, flags } = parseCLI(command);

  for (const [flag, value] of Object.entries(flags)) {
    const vitestFlag = JEST_CLI_MAP[flag];

    if (!vitestFlag) {
      continue;
    }

    if (vitestFlag.multi) {
      newFlags.push(separateMultiValue(flag, value));
    } else {
      const newFlag = vitestFlag.flag ?? flag;
      const newValue = vitestFlag.value ? [vitestFlag.value] : value;

      newFlags.push(...extractFlag(newFlag, newValue));
    }
  }

  const tokens = ['vitest'];
  if (args.length) {
    tokens.push(args.join(' '));
  }

  if (newFlags.length) {
    tokens.push(newFlags.join(' '));
  }

  return tokens.join(' ');
}

export function transformJestScriptsToVitest(scripts: Record<string, string>): Record<string, string> {
  const newScripts: Record<string, string> = {};
  let hasJest = false;

  for (const [script, value] of Object.entries(scripts)) {
    const commands = value.split(SEPARATOR_PATTERN);

    for (let idx = 0; idx < commands.length; idx++) {
      const trimmedCommand = commands[idx]?.trim() as string;

      if (isJestCommand(trimmedCommand)) {
        hasJest = true;
        commands[idx] = convertCommandToVitestScript(trimmedCommand);
      }
    }

    let newCommand = '';

    while (commands.length) {
      newCommand += commands.shift();
      if (commands.length) {
        newCommand += ` ${commands.shift()} `;
      }
    }

    newScripts[script] = newCommand.trim();
  }

  if (!hasJest) {
    newScripts["test:vitest"] = "vitest";
  }

  return newScripts;
}