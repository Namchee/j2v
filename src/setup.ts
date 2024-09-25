import type { UserConfig } from "vitest/config";
import { Logger } from "./logger";

export type CleanupFile = {
  vitestImports: string[];
  imports: string[];
  code: string[];

  configImports: string[];
  plugins: string[];
};

export function constructDOMCleanupFile(
  config: UserConfig["test"],
  packages: string[],
): CleanupFile | undefined {
  const vitestImports = [];
  const imports = [];
  const code: string[] = [];
  const plugins: string[] = [];
  const configImports: string[] = [];

  const isDom = ["happy-dom", "jsdom"].includes(config?.environment || "");
  if (!isDom) {
    return undefined;
  }

  const hasJestDOMInstalled = packages.includes("@testing-library/jest-dom");
  if (hasJestDOMInstalled) {
    imports.push(`import '@testing-library/jest-dom/vitest';`);
  }

  const hasReactInstalled = packages.includes("@testing-library/react");
  const hasVueInstalled = packages.includes("@testing-library/vue");
  const hasSvelteInstalled = packages.includes("@testing-library/svelte");
  const hasPreactInstalled = packages.includes("@testing-library/preact");

  if (hasReactInstalled) {
    Logger.debug("React detected. Adding cleanup for React.");
    imports.push(`import { cleanup } from '@testing-library/react';`);
  }

  if (hasVueInstalled) {
    Logger.debug("Vue detected. Adding cleanup for Vue.");
    imports.push(`import { cleanup } from '@testing-library/vue';`);
  }

  if (hasPreactInstalled) {
    Logger.debug("Preact detected. Adding cleanup for Preact.");
    imports.push(`import { cleanup } from '@testing-library/preact';`);
  }

  if (hasSvelteInstalled) {
    Logger.debug("Svelte detected. Adding cleanup for Svelte.");

    const isSveltekit = packages.includes("@sveltejs/kit");
    if (isSveltekit) {
      Logger.debug("Configuring for SvelteKit.");

      configImports.push(`import { sveltekit } from '@sveltejs/kit/vite';`);
      plugins.push("sveltekit()");
    } else {
      configImports.push(
        `import { svelte } from '@sveltejs/vite-plugin-svelte';`,
      );
      plugins.push("svelte()");
    }

    imports.push(
      `import { svelteTesting } from '@testing-library/svelte/vite';`,
    );
    plugins.push("svelteTesting()");
  }

  if (
    hasReactInstalled ||
    hasVueInstalled ||
    hasPreactInstalled
  ) {
    vitestImports.push("afterEach");

    code.push(`afterEach(() => {
  cleanup();
});`);
  }

  return {
    vitestImports,
    imports,
    configImports,
    code,
    plugins,
  };
}
