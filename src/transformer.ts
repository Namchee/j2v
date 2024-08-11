import type { TestFile } from "./test";

import type { UserConfig } from "vitest/config";

export function transformJestTestToVitest(testFiles: TestFile[], config: UserConfig["test"]): TestFile[] {
  return [];
}
