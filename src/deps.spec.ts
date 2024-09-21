

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import * as cp from "node:child_process";

import { getNeededPackages, getRemovedPackages, install, uninstall } from "./deps";

vi.mock("node:child_process", () => {
  return {
    execSync: vi.fn(),
  };
});

describe("installVitest", () => {
  const defaultConfig = {
    coverage: {
      enabled: false,
    },
  };

  it('should return ["vitest"] when "vitest" is not in packages', () => {
    const packages = ["some-other-package"];
    const script = { coverage: false, commands: {}, modified: [] };
    const result = getNeededPackages(packages, script, defaultConfig);
    expect(result).toEqual(["vitest"]);
  });

  it('should not return "vitest" when "vitest" is already in packages', () => {
    const packages = ["vitest"];
    const script = { coverage: false, commands: {}, modified: [] };
    const result = getNeededPackages(packages, script, defaultConfig);
    expect(result).toEqual([]);
  });

  it('should return "@vitest/coverage-v8" when coverage is enabled in script and not in packages', () => {
    const packages = ["vitest"];
    const script = { coverage: true, commands: {}, modified: [] };
    const result = getNeededPackages(packages, script, defaultConfig);
    expect(result).toEqual(["@vitest/coverage-v8"]);
  });

  it('should return "@vitest/coverage-v8" when coverage is enabled in config and not in packages', () => {
    const packages = ["vitest"];
    const script = { coverage: false, commands: {}, modified: [] };
    const config = {
      coverage: {
        enabled: true,
      },
    };
    const result = getNeededPackages(packages, script, config);
    expect(result).toEqual(["@vitest/coverage-v8"]);
  });

  it('should return both "vitest" and "@vitest/coverage-v8" when neither are in packages, and coverage is enabled', () => {
    const packages = ["some-other-package"];
    const script = { coverage: true, commands: {}, modified: [] };
    const config = {
      coverage: {
        enabled: true,
      },
    };
    const result = getNeededPackages(packages, script, config);
    expect(result).toEqual(["vitest", "@vitest/coverage-v8"]);
  });

  it('should return an empty array when both "vitest" and "@vitest/coverage-v8" are in packages', () => {
    const packages = ["vitest", "@vitest/coverage-v8"];
    const script = { coverage: true, commands: {}, modified: [] };
    const result = getNeededPackages(packages, script, defaultConfig);
    expect(result).toEqual([]);
  });
});

describe("getRemovedPackages", () => {
  it("should return an empty array when there are no packages", () => {
    const packages: string[] = [];
    const result = getRemovedPackages(packages);
    expect(result).toEqual([]);
  });

  it("should return some old jest dependencies", () => {
    const packages: string[] = ["jest", "@types/jest", "@jest/globals", "fake-jest"];
    const result = getRemovedPackages(packages);
    expect(result).toEqual(["jest", "@types/jest", "@jest/globals"]);
  });

  it("should return ts-jest", () => {
    const packages: string[] = ["jest", "ts-jest"];
    const result = getRemovedPackages(packages);
    expect(result).toEqual(["jest", "ts-jest"]);
  });
});

describe("install", () => {
  it("should run execSync with provided deps", () => {
    const spy = vi.spyOn(cp, "execSync");

    install("npm", ["vitest"]);

    expect(spy).toHaveBeenCalledWith("npm install -D vitest");
  });
});

describe("uninstall", () => {
  it("should run execSync with provided deps", () => {
    const spy = vi.spyOn(cp, "execSync");

    uninstall("yarn", ["jest", "@types/jest", "@jest/globals"]);

    expect(spy).toHaveBeenCalledWith("yarn remove jest @types/jest @jest/globals");
  });
})
