import glob from "tiny-glob";

import type { UserConfig } from "vitest/config";

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

  const files = [...new Set(inputs.flat())];

  return [];
}
