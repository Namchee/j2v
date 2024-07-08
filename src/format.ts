import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { inspect } from "node:util";

import type { UserConfig } from "vitest/config";
import type { CleanupFile } from "./setup";

export function generateVitestConfig(config: UserConfig["test"], isTS: boolean, cleanup: CleanupFile | undefined, ) {
  const configString = inspect(config, { compact: false })
    .split("\n")
    .map((value, idx) => {
      return idx > 0 ? `  ${value}` : value;
    })
    .join("\n");

  const imports = [
    `import { defineConfig } from 'vitest/config';`,
  ];
  if (cleanup?.configImports) {
    imports.push(...cleanup.configImports);
  }

  const configContent = [];
  if (cleanup?.plugins) {
    configContent.push(`  plugins: [${cleanup.plugins.join(', ')}]`);
  }

  configContent.push(`  test: ${configString}`);

  writeFileSync(resolve(process.cwd(), `vitest.config.${isTS ? 'ts' : 'js'}`), `${imports.join('\n')}

export default defineConfig({
${configContent.join('\n')}
});
`);
}

export function generateSetupFile(cleanup: CleanupFile, isTS: boolean) {
  const setupFile =
}

