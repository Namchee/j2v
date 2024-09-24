import exec from "nanoexec";

import type { UserConfig } from "vitest/config";
import type { ScriptTransformationResult } from "./scripts";

const JEST_DEPS_LIST = [
  "jest",
  "ts-jest",
  "@types/jest",
  "@jest/globals",
  "babel-jest",
  "svelte-jester",
  "@swc/jest",
  "eslint-plugin-jest",
];

const MANAGER_COMMAND_MAP = {
  npm: {
    install: "install",
    remove: "uninstall",
  },
  yarn: {
    install: "add",
    remove: "remove",
  },
  pnpm: {
    install: "add",
    remove: "remove",
  },
  bun: {
    install: "install",
    remove: "uninstall",
  },
};

export function getNeededPackages(packages: string[], script: ScriptTransformationResult, config: UserConfig["test"]) {
  const neededPackages = [];
  if (!packages.includes("vitest")) {
    neededPackages.push("vitest");
  }

  if ((script.coverage || config?.coverage?.enabled) && !packages.includes("@vitest/coverage-v8")) {
    neededPackages.push("@vitest/coverage-v8");
  }

  return neededPackages;
}

export function getRemovedPackages(
  packages: string[],
): string[] {
  return JEST_DEPS_LIST.filter((dep) =>
    packages.includes(dep),
  );
}

export async function install(
  manager: "npm" | "yarn" | "pnpm" | "bun",
  deps: string[],
) {
  if (deps.length) {
    await exec(manager, [MANAGER_COMMAND_MAP[manager].install, "-D", ...deps]);
  }
}

export async function uninstall(
  manager: "npm" | "yarn" | "pnpm" | "bun",
  deps: string[],
) {
  if (deps.length) {
    await exec(manager, [MANAGER_COMMAND_MAP[manager].remove, ...deps]);
  }
}
