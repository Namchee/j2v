import { describe, expect, it } from "vitest";

import { constructDOMCleanupFile } from "./setup";

describe("constructDOMCleanupFile", () => {
  it("shouldn't construct any cleanup file if environment isn't DOM", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "node" }, [
      "vue",
    ]);

    expect(cleanupFile).toBeUndefined();
  });

  it("should write cleanup file for jest-dom users", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/jest-dom",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([]);
    expect(cleanupFile?.code).toStrictEqual([]);
    expect(cleanupFile?.vitestImports).toStrictEqual([]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import '@testing-library/jest-dom/vitest';`,
    ]);
    expect(cleanupFile?.plugins).toStrictEqual([]);
  });

  it("should write cleanup file for react-based tests", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/react",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([]);
    expect(cleanupFile?.code).toStrictEqual([
      "afterEach(() => {\n  cleanup();\n});",
    ]);
    expect(cleanupFile?.vitestImports).toStrictEqual(["afterEach"]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import { cleanup } from '@testing-library/react';`,
    ]);
    expect(cleanupFile?.plugins).toStrictEqual([]);
  });

  it("should write cleanup file for vue-based tests", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/vue",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([]);
    expect(cleanupFile?.code).toStrictEqual([
      "afterEach(() => {\n  cleanup();\n});",
    ]);
    expect(cleanupFile?.vitestImports).toStrictEqual(["afterEach"]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import { cleanup } from '@testing-library/vue';`,
    ]);
    expect(cleanupFile?.plugins).toHaveLength(0);
  });

  it("should write cleanup file for preact-based tests", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/preact",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([]);
    expect(cleanupFile?.code).toStrictEqual([
      "afterEach(() => {\n  cleanup();\n});",
    ]);
    expect(cleanupFile?.vitestImports).toStrictEqual(["afterEach"]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import { cleanup } from '@testing-library/preact';`,
    ]);
    expect(cleanupFile?.plugins).toStrictEqual([]);
  });

  it("should write cleanup file for svelte-based without sveltekit tests", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/svelte",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([
      `import { svelte } from '@sveltejs/vite-plugin-svelte';`,
    ]);
    expect(cleanupFile?.code).toStrictEqual([]);
    expect(cleanupFile?.vitestImports).toStrictEqual([]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import { svelteTesting } from '@testing-library/svelte/vite';`,
    ]);
    expect(cleanupFile?.plugins).toStrictEqual(["svelte()", "svelteTesting()"]);
  });

  it("should write cleanup file for svelte-based with sveltekit tests", () => {
    const cleanupFile = constructDOMCleanupFile({ environment: "jsdom" }, [
      "@testing-library/svelte",
      "@sveltejs/kit",
    ]);

    expect(cleanupFile?.configImports).toStrictEqual([
      `import { sveltekit } from '@sveltejs/kit/vite';`,
    ]);
    expect(cleanupFile?.code).toStrictEqual([]);
    expect(cleanupFile?.vitestImports).toStrictEqual([]);
    expect(cleanupFile?.imports).toStrictEqual([
      `import { svelteTesting } from '@testing-library/svelte/vite';`,
    ]);
    expect(cleanupFile?.plugins).toStrictEqual([
      "sveltekit()",
      "svelteTesting()",
    ]);
  });
});
