import { describe, expect, it, } from "vitest";

import type { UserConfig } from "vitest/config";

import { formatSetupFile, formatVitestConfig } from "./formatter";
import type { CleanupFile } from "./setup";

describe("formatVitestConfig", () => {
  it("should provide minimal formatting", () => {
    const config: UserConfig["test"] = {
      bail: 1,
      coverage: {
        enabled: true,
      },
    };

    const formattedConfig = formatVitestConfig(config);

    expect(formattedConfig).toBe(`import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    bail: 1,
    coverage: {
      enabled: true
    }
  }
});
`);
  });

  it("should add additional import for plugins", () => {
    const config: UserConfig["test"] = {
      bail: 1,
      coverage: {
        enabled: true,
      },
    };

    const cleanup: CleanupFile = {
      vitestImports: [],
      code: [],
      imports: [],
      configImports: [
        `import { svelteTesting } from '@testing-library/svelte/vite';`,
        `import { sveltekit } from '@sveltejs/kit/vite';`,
      ],
      plugins: ["sveltekit()", "svelteTesting()"],
    };

    const formattedConfig = formatVitestConfig(config, cleanup);

    expect(formattedConfig).toBe(`import { defineConfig } from 'vitest/config';

import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  test: {
    bail: 1,
    coverage: {
      enabled: true
    }
  }
});
`);
  });
});

describe("formatSetupFile", () => {
  it("should format the cleanup file", () => {
    const cleanup: CleanupFile = {
      vitestImports: ["afterEach"],
      code: ["afterEach(() => {\n  cleanup();\n});",],
      imports: [`import { cleanup } from '@testing-library/react';`],
      configImports: [
        `import { svelteTesting } from '@testing-library/svelte/vite';`,
        `import { sveltekit } from '@sveltejs/kit/vite';`,
      ],
      plugins: ["sveltekit()", "svelteTesting()"],
    };

    const formattedSetupFile = formatSetupFile(cleanup);

    expect(formattedSetupFile).toBe(`import { afterEach } from 'vitest';

import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
`)
  });

  it("should format the cleanup file for only jest-dom", () => {
    const cleanup: CleanupFile = {
      vitestImports: [],
      code: [],
      imports: [`import '@testing-library/jest-dom/vitest';`],
      configImports: [],
      plugins: [],
    };

    const formattedSetupFile = formatSetupFile(cleanup);

    expect(formattedSetupFile).toBe(`import '@testing-library/jest-dom/vitest';
`)
  });
});
