import type { UserConfig } from "vitest/config";

export function addCleanupFiles(config: UserConfig, packages: string[]) {
  const vitestImport = [];
  const imports = [];
  const code: string[] = [];

  const isDom = ['happy-dom', 'jsdom'].includes(config?.test?.environment || '');
  if (!isDom) {
    return;
  }

  const hasJestDOMInstalled = packages.includes('@testing-library/jest-dom');
  if (hasJestDOMInstalled) {
    imports.push(`import '@testing-library/jest-dom/vitest';`)
  }

  const hasReactInstalled = packages.includes('@testing-library/react');
  const hasVueInstalled = packages.includes('@testing-library/vue');
  const hasSvelteInstalled = packages.includes('@testing-library/svelte');
  const hasPreactInstalled = packages.includes('@testing-library/preact');

  if (hasReactInstalled) {
    imports.push(`import { cleanup } from '@testing-library/react';`);
  }

  if (hasVueInstalled) {
    imports.push(`import { cleanup } from '@testing-library/vue';`);
  }

  if (hasPreactInstalled) {
    imports.push(`import { cleanup } from '@testing-library/preact';`)
  }

  if (hasReactInstalled || hasVueInstalled || hasSvelteInstalled || hasPreactInstalled) {
    vitestImport.push('afterEach');

    if (code) {
      code.push('\n');
    }

    code.push(`afterEach(() => {
  cleanup();
});`);
  }
}

