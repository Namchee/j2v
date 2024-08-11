import { readFile as readFileCb } from "node:fs";
import { promisify } from "node:util";

import glob from "tiny-glob";

import type { UserConfig } from "vitest/config";

const readFile = promisify(readFileCb);

const DEFAULT_INCLUDES = ['**/*.{test,spec}.?(c|m)[jt]s?(x)'];
const DEFAULT_EXCLUDES = ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'];

export type TestFile = {
  path: string;
  content: string;
}

export async function getTestFiles(config: UserConfig["test"]): Promise<TestFile[]> {
  const includes = config?.include || DEFAULT_INCLUDES;
  const excludes = config?.exclude || DEFAULT_EXCLUDES;

  const promises: Promise<string[]>[] = includes.map(inclusion => glob(inclusion));
  const inputs = await Promise.all(promises);

  let files = [...new Set(inputs.flat())];

  for (const exclusion of excludes) {
    files = files.filter(file => !file.match(exclusion.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')));
  }

  const testFiles = files.map(async (path) => {
    const content = await readFile(path);

    return {
      path,
      content: content.toString(),
    };
  });

  return Promise.all(testFiles);
}
