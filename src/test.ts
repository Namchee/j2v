import { readFile as readFileCb } from "node:fs";
import { promisify } from "node:util";

import { globSync } from "tinyglobby";

import type { UserConfig } from "vitest/config";

const readFile = promisify(readFileCb);

const DEFAULT_INCLUDES = ['**/*.{test,spec}.?(c|m)[jt]s?(x)'];
const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'];

export type TestFile = {
  path: string;
  content: string;
}

export function getTestFiles(config: UserConfig["test"]): Promise<TestFile[]> {
  const includes = config?.include || DEFAULT_INCLUDES;
  const excludes = config?.exclude || DEFAULT_EXCLUDES;

  const files = globSync(includes, { ignore: excludes });

  const testFiles = files.map(async (path) => {
    const content = await readFile(path);

    return {
      path,
      content: content.toString(),
    };
  });

  return Promise.all(testFiles);
}
