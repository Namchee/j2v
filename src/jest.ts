import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isAsyncFunction } from "node:util/types";

import { tsImport } from "tsx/esm/api";

import type { Config as JestConfig } from "jest";

const JEST_JS_CONFIG = ["jest.config.js", "jest.config.cjs", "jest.config.mjs"];
const JEST_TS_CONFIG = ["jest.config.ts", "jest.config.cts", "jest.config.mts"];

export async function getJestConfig(): Promise<JestConfig> {
  for (const config of JEST_TS_CONFIG) {
    if (existsSync(config)) {
      const { default: cfg } = await tsImport(
        resolve(process.cwd(), config),
        import.meta.url,
      );
      if (isAsyncFunction(cfg)) {
        const realCfg = await cfg();

        return realCfg;
      }

      return cfg;
    }
  }

  for (const config of JEST_JS_CONFIG) {
    if (existsSync(config)) {
      const { default: cfg } = await import(resolve(process.cwd(), config));
      if (isAsyncFunction(cfg)) {
        const realCfg = await cfg();

        return realCfg;
      }

      return cfg;
    }
  }

  if (existsSync(resolve(process.cwd(), "jest.config.json"))) {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), "jest.config.json")).toString(),
    );
  }

  const packageJson = JSON.parse(
    readFileSync(resolve(process.cwd(), "package.json")).toString(),
  );
  if ("jest" in packageJson) {
    return packageJson.jest;
  }

  return {};
}