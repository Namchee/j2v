import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isAsyncFunction } from "node:util/types";

import { tsImport } from "tsx/esm/api";

import type { Config as JestConfig } from "jest";
import { fileExist } from "./fs";

const JEST_CONFIG = [
  "jest.config.ts",
  "jest.config.js",
  "jest.config.cjs",
  "jest.config.mjs",
  "jest.config.cts",
  "jest.config.mts",
];

export type JestUserConfig = {
  path: string;
  config: JestConfig;
};

export async function getJestConfig(basepath: string): Promise<JestUserConfig> {
  for (const config of JEST_CONFIG) {
    const cfgPath = resolve(basepath, config);

    if (await fileExist(cfgPath)) {
      const { default: cfg } = await tsImport(cfgPath, import.meta.url);

      if (typeof cfg === "function") {
        const realCfg: JestConfig = isAsyncFunction(cfg) ? await cfg() : cfg();

        return {
          path: cfgPath,
          config: realCfg,
        };
      }

      return {
        path: cfgPath,
        config: cfg,
      };
    }
  }

  if (await fileExist(resolve(basepath, "jest.config.json"))) {
    const rawConfig = await readFile(resolve(basepath, "jest.config.json"));
    return {
      path: resolve(basepath, "jest.config.json"),
      config: JSON.parse(rawConfig.toString()),
    };
  }

  const packageJsonPath = resolve(basepath, "package.json");
  if (await fileExist(packageJsonPath)) {
    const rawJSON = await readFile(packageJsonPath);

    const packageJson = JSON.parse(rawJSON.toString());

    if ("jest" in packageJson) {
      return {
        path: resolve(basepath, "package.json"),
        config: packageJson.jest,
      };
    }
  }

  return {
    path: "",
    config: {},
  };
}
