import { readFileSync, rmSync, writeFileSync } from "node:fs";
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
  const configFile = `${imports.join('\n')}

export default defineConfig({
${configContent.join('\n')}
});
`;

  writeFileSync(resolve(process.cwd(), `vitest.config.${isTS ? 'ts' : 'js'}`), configFile);
}

export function generateSetupFile(cleanup: CleanupFile, isTS: boolean) {
  const setupFile = `import { ${cleanup.vitestImports.join(', ')} };
${cleanup.imports.join('\n')}

${cleanup.code}
`;

  writeFileSync(resolve(process.cwd(), `vitest-setup.${isTS ? 'ts' : 'js'}`), setupFile);
}

export function removeJestConfig(name: string) {
  if (name.length > 0) {
    if (name.endsWith('package.json')) {
      const json = JSON.parse(readFileSync(name).toString());
      const { jest, ...rest } = json;

      writeFileSync(name, JSON.stringify(rest, null, 2));
    } else {
      rmSync(name);
    }
  }
}
