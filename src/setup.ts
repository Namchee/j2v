import type { UserConfig } from "vitest/config";

export function addCleanupFiles(config: UserConfig["test"], packages: string[]) {
  const vitestImport = [];
  const imports = [];
  const code = [];

  const isDom = ['happy-dom', 'jsdom'].includes(config?.environment || '');
  const hasJestDOMInstalled = packages.includes('@testing-library/jest-dom');

  if (isDom && hasJestDOMInstalled) {
    vitestImport.push('expect');
    imports.push(`import * as matchers from '@testing-library/jest-dom/matchers';`)
    code.push('expect.extend(matchers);');
  }

  const hasReactInstalled = packages.includes('@testing-library/react');
  if (isDom && hasReactInstalled) {
    vitestImport.push('afterEach');
    imports.push(`import { cleanup } from '@testing-library/react';`);
    code.push(`afterEach(() => {
  cleanup();
});`)
  }
}

