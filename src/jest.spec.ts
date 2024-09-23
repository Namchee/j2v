import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { type Mock, describe, expect, test, vi } from "vitest";

import { tsImport } from "tsx/esm/api";

import { fileExist } from "./fs";
import { getJestConfig } from "./jest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

vi.mock("./fs", () => ({
  fileExist: vi.fn(),
}));

vi.mock("tsx/esm/api", () => ({
  tsImport: vi.fn(),
}));

describe("getJestConfig", () => {
  const basepath = ".";

  test("should return Jest config from a supported config file", async () => {
    const configPath = resolve(basepath, "jest.config.ts");
    (fileExist as Mock).mockResolvedValueOnce(true);
    (tsImport as Mock).mockResolvedValueOnce({
      default: { testEnvironment: "node" },
    });

    const result = await getJestConfig(basepath);

    expect(fileExist).toHaveBeenCalledWith(configPath);
    expect(tsImport).toHaveBeenCalled();
    expect(result).toEqual({
      path: configPath,
      config: { testEnvironment: "node" },
    });
  });

  test("should return Jest config from package.json", async () => {
    const packageJsonPath = resolve(basepath, "package.json");
    (fileExist as Mock)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    (fileExist as Mock).mockResolvedValueOnce(true);
    (readFile as Mock).mockResolvedValueOnce(
      JSON.stringify({ jest: { testEnvironment: "jsdom" } }),
    );

    const result = await getJestConfig(basepath);

    expect(fileExist).toHaveBeenCalledWith(packageJsonPath);
    expect(readFile).toHaveBeenCalled();
    expect(result).toEqual({
      path: packageJsonPath,
      config: { testEnvironment: "jsdom" },
    });
  });

  test("should return an empty config if no Jest config is found", async () => {
    (fileExist as Mock).mockResolvedValue(false);

    const result = await getJestConfig(basepath);

    expect(result).toEqual({
      path: "",
      config: {},
    });
  });
});
