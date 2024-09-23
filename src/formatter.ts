import { readFile, rm, writeFile } from "node:fs/promises";
import { inspect } from "node:util";

import type { UserConfig } from "vitest/config";

import type { CleanupFile } from "./setup";

export function formatVitestConfig(
  config: UserConfig["test"],
  cleanup?: CleanupFile,
): string {
  const configString = inspect(config, { compact: false })
    .split("\n")
    .map((value, idx) => {
      return idx > 0 ? `  ${value}` : value;
    })
    .join("\n");

  const imports = [`import { defineConfig } from 'vitest/config';`];
  if (cleanup?.configImports) {
    imports.push(...cleanup.configImports);
  }

  const configContent = [];
  if (cleanup?.plugins) {
    configContent.push(`  plugins: [${cleanup.plugins.join(", ")}],`);
  }

  if (imports.length > 1) {
    imports[0] += "\n";
  }

  configContent.push(`  test: ${configString}`);
  return `${imports.join("\n")}

export default defineConfig({
${configContent.join("\n")}
});
`;
}

export function formatSetupFile(cleanup: CleanupFile): string {
  const parts = [];

  if (cleanup.vitestImports.length) {
    parts.push(`import { ${cleanup.vitestImports.join(", ")} } from 'vitest';`);
  }

  if (cleanup.imports.length) {
    parts.push(cleanup.imports.join("\n"));
  }

  if (cleanup.code.length) {
    parts.push(cleanup.code);
  }
  return `${parts.join("\n\n")}
`;
}

export async function removeJestConfig(name: string) {
  if (name.length > 0) {
    if (!name.endsWith("package.json")) {
      await rm(name);

      return;
    }

    const rawFile = await readFile(name);

    const json = JSON.parse(rawFile.toString());
    const { jest, ...rest } = json;

    await writeFile(name, JSON.stringify(rest, null, 2));
  }
}
