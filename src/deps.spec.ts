import * as cp from "node:child_process";

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installVitest, removeJestDeps } from "./deps";

vi.mock("node:child_process", () => {
  return {
    execSync: vi.fn(),
  };
});

describe("installVitest", () => {
  let execSpy: MockInstance;

  beforeEach(() => {
    execSpy = vi.spyOn(cp, "execSync");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should install vitest with npm", () => {
    installVitest("npm", []);

    expect(execSpy).toHaveBeenCalledWith("npm install -D vitest");
  });

  it("should install vitest with pnpm", () => {
    installVitest("pnpm", []);

    expect(execSpy).toHaveBeenCalledWith("pnpm add -D vitest");
  });

  it("should install vitest with yarn", () => {
    installVitest("yarn", []);

    expect(execSpy).toHaveBeenCalledWith("yarn add -D vitest");
  });

  it("should install vitest with bun", () => {
    installVitest("bun", []);

    expect(execSpy).toHaveBeenCalledWith("bun install -D vitest");
  });

  it("should not install vitest if its already exists", () => {
    installVitest("npm", ["vitest"]);

    expect(execSpy).not.toHaveBeenCalled();
  });
});

describe("removeJestDeps", () => {
  let execSpy: MockInstance;

  beforeEach(() => {
    execSpy = vi.spyOn(cp, "execSync");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should uninstall jest core deps", () => {
    removeJestDeps("npm", ["jest"]);

    expect(execSpy).toHaveBeenCalledWith("npm uninstall jest");
  });

  it("should uninstall jest with typescript", () => {
    removeJestDeps("npm", ["jest", "ts-jest", "@types/jest", "@jest/globals"]);

    expect(execSpy).toHaveBeenCalledWith("npm uninstall jest ts-jest @types/jest @jest/globals");
  });

  it("should not uninstall anything as jest doesn't exist", () => {
    removeJestDeps("npm", ["vitest"]);

    expect(execSpy).not.toHaveBeenCalled();
  });
});
