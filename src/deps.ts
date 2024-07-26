import { execSync } from "node:child_process";

const JEST_DEPS_LIST = ["jest", "ts-jest", "@types/jest", "@jest/globals", "babel-jest"];

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

export function installVitest(
  manager: "npm" | "yarn" | "pnpm" | "bun",
  packages: string[],
) {
  const shouldSkip = packages.includes("vitest");
  if (!shouldSkip) {
    execSync(`${manager} ${MANAGER_COMMAND_MAP[manager].install} -D vitest`);
  }
}

export function removeJestDeps(
  manager: "npm" | "yarn" | "pnpm" | "bun",
  packages: string[],
) {
  const toBeUninstalled = JEST_DEPS_LIST.filter((dep) =>
    packages.includes(dep),
  );
  if (toBeUninstalled.length) {
    execSync(
      `${manager} ${MANAGER_COMMAND_MAP[manager].remove} ${toBeUninstalled.join(" ")}`,
    );
  }
}
