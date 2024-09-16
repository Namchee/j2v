import * as fs from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";
import type { UserConfig } from "vitest/config";

import * as tg from "tinyglobby";

import { getTestFiles } from "./fs";

vi.mock("tinyglobby", () => ({
  globSync: vi.fn(),
}));
vi.mock("node:fs/promises", async (orig) => {
  const actual = await orig<typeof import("node:fs/promises")>();

  return {
    ...actual,
    readFile: vi.fn(),
  }
});

describe("getTestFiles", () => {
  it("should process inclusion and exclusion from config", async () => {
    const config: UserConfig["test"] = {
      include: ["**/foo.ts"],
      exclude: ["**/bar.ts"],
    };

    const tgSpy = vi.spyOn(tg, "globSync").mockReturnValue(["test.ts"]);
    const readFileSpy = vi.spyOn(fs, "readFile").mockResolvedValue(Buffer.from(""));

    const files = await getTestFiles(config);

    expect(files).toEqual([{ path: 'test.ts', content: "" }]);
    expect(tgSpy).toHaveBeenCalledWith(["**/foo.ts"], { ignore: ["**/bar.ts"] });
    expect(readFileSpy).toHaveBeenCalledWith("test.ts");
  });

  it("should use default inclusion", async () => {
    const config: UserConfig["test"] = {
      exclude: ["**/bar.ts"],
    };

    const spy = vi.spyOn(tg, "globSync").mockReturnValue([]);
    const files = await getTestFiles(config);

    expect(files).toEqual([]);
    expect(spy).toHaveBeenCalledWith(['**/*.{test,spec}.?(c|m)[jt]s?(x)'], { ignore: ["**/bar.ts"] });
  });

  it("should use default exclusion", async () => {
    const config: UserConfig["test"] = {
      include: ["**/foo.ts"],
    };

    const spy = vi.spyOn(tg, "globSync");
    const files = await getTestFiles(config);

    expect(files).toEqual([]);
    expect(spy).toHaveBeenCalledWith(["**/foo.ts"], { ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ] });
  })
});
