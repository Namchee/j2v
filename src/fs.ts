import { access, readFile } from "node:fs/promises";

import { globSync } from "tinyglobby";

import type { UserConfig } from "vitest/config";

const DEFAULT_INCLUDES = ["**/*.{test,spec}.?(c|m)[jt]s?(x)"];
const DEFAULT_EXCLUDES = [
  "**/node_modules/**",
  "**/dist/**",
  "**/cypress/**",
  "**/.{idea,git,cache,output,temp}/**",
  "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
];

export type TestFile = {
  path: string;
  content: string;
};

export function getTestFiles(config: UserConfig["test"]): Promise<TestFile[]> {
  const includes = config?.include || DEFAULT_INCLUDES;
  const excludes = config?.exclude || DEFAULT_EXCLUDES;

  const globs = globSync(includes, { ignore: excludes });

  return Promise.all(globs.map(async (path) => {
    const content = await readFile(path);

    return {
      path,
      content: content.toString(),
    };
  }));
}

export async function fileExist(path: string): Promise<boolean> {
  try {
    await access(path);

    return true;
  } catch (_) {
    return false;
  }
}
