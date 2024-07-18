
// Maps Jest CLI options to Vitest
const JEST_CLI_MAP = {
  bail: ['bail'],
  changedFilesWithAncestor: ['changed', 'HEAD~1'],
  changedSince: ['changed'],
  config: ['config'],
  c: ['c'],
  coverage: ['coverage.enabled'],
  collectCoverage: ['coverage.enabled'],
  coverageDirectory: ['coverage.reportsDirectory'],
  env: ['environment'],
  expand: ['expandSnapshotDiff'],
  injectGlobals: ['globals'],
  json: ['json'],
  lastCommit: ['changed', 'HEAD~1'],
  logHeapUsage: ['logHeapUsage'],
  maxConcurrency: ['maxConcurrency'],
  maxWorkers: ['maxWorkers'],
  noStackTrace: ['printConsoleTrace', 'false'],
  onlyChanged: ['changed', 'HEAD~1'],
  outputFile: ['outputFile'],
  passWithNoTests: ['passWithNoTests'],
  randomize: ['sequence.shuffle.tests'],
  seed: ['sequence.seed'],
  reporters: ['coverage.reporter'],
  roots: ['root'], // TODO: multi value
  runInBand: ['sequence.concurrent', 'false'],
  selectProjects: ['project'], // TODO: multi value
  shard: ['shard'],
  silent: ['silent'],
  testNamePattern: ['testNamePattern'],
  t: ['t'],
  testPathIgnorePatterns: ['exclude'],
  testTimeout: ['testTimeout'],
  updateSnaphot: ['update'],
  watch: ['watch']
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
