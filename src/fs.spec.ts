import { describe, expect, it, vi } from "vitest";
import type { UserConfig } from "vitest/config";

import * as tg from "tinyglobby";

import { getTestFiles } from "./fs";

vi.mock("tinyglobby", () => ({
  globSync: vi.fn().mockReturnValue([]),
}));

describe("getTestFiles", () => {
  it("should process inclusion and exclusion from config", () => {
    const config: UserConfig["test"] = {
      include: ["**/foo.ts"],
      exclude: ["**/bar.ts"],
    };

    const spy = vi.spyOn(tg, "globSync");

    expect(getTestFiles(config)).toEqual([]);
    expect(spy).toHaveBeenCalledWith(["**/foo.ts"], { ignore: ["**/bar.ts"] });
  });

  it("should use default inclusion", () => {
    const config: UserConfig["test"] = {
      exclude: ["**/bar.ts"],
    };

    const spy = vi.spyOn(tg, "globSync");

    expect(getTestFiles(config)).toEqual([]);
    expect(spy).toHaveBeenCalledWith(['**/*.{test,spec}.?(c|m)[jt]s?(x)'], { ignore: ["**/bar.ts"] });
  });

  it("should use default exclusion", () => {
    const config: UserConfig["test"] = {
      include: ["**/foo.ts"],
    };

    const spy = vi.spyOn(tg, "globSync");

    expect(getTestFiles(config)).toEqual([]);
    expect(spy).toHaveBeenCalledWith(["**/foo.ts"], { ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ] });
  })
});
