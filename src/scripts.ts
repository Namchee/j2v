
const JEST_CLI_MAP = {

}

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
