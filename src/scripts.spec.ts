import { describe, expect, it } from "vitest";

import { transformJestScriptsToVitest } from "./scripts";

describe("transformJestScriptToVitest", () => {
  it("should transform nothing", () => {
    const scripts = {
      start: 'node index.js',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      start: 'node index.js',
      "test:vitest": "vitest"
    });
  });

  it("should transform a normal jest script without payload", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest',
      "test:integration": "jest tests/integrations/**.spec.ts",
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      start: 'node index.js',
      "test": "vitest",
      "test:integration": "vitest tests/integrations/**.spec.ts",
    });
  });

  it("should transform a chained jest script", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest src/a/**.spec.ts & jest src/b/**.test.ts && jest dist/c/*.ts',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      start: 'node index.js',
      "test": "vitest src/a/**.spec.ts & vitest src/b/**.test.ts && vitest dist/c/*.ts",
    });
  });
});
