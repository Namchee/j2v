import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isAsyncFunction } from "node:util/types";

import { tsImport } from "tsx/esm/api";

import type { Config as JestConfig } from "jest";

const JEST_CONFIG = ["jest.config.ts", "jest.config.js", "jest.config.cjs", "jest.config.mjs", "jest.config.cts", "jest.config.mts"];

export type JestUserConfig = {
  path: string;
  config: JestConfig
}

export async function getJestConfig(): Promise<JestUserConfig> {
  for (const config of JEST_CONFIG) {
    const cfgPath = resolve(process.cwd(), config);

    if (existsSync(cfgPath)) {
      const { default: cfg } = await tsImport(
        cfgPath,
        import.meta.url,
      );

      if (typeof cfg === 'function') {
        const realCfg: JestConfig = isAsyncFunction(cfg)
          ? await cfg()
          : cfg();

        return {
          path: cfgPath,
          config: realCfg,
        };
      }

      return {
        path: cfgPath,
        config: cfg,
      }
    }
  }

  if (existsSync(resolve(process.cwd(), "jest.config.json"))) {
    return {
      path: resolve(process.cwd(), "jest.config.json"),
      config: JSON.parse(
        readFileSync(resolve(process.cwd(), "jest.config.json")).toString(),
      ),
    };
  }

  const packageJsonPath = resolve(process.cwd(), "package.json");
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json")).toString(),
    );

    if ("jest" in packageJson) {
      return {
        path: resolve(process.cwd(), "package.json"),
        config: packageJson.jest,
      };
    }
  }

  return {
    path: '',
    config: {},
  };
}
