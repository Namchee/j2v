import { describe, expect, it } from "vitest";

import { transformJestScriptsToVitest } from "./scripts";

describe("transformJestScriptToVitest", () => {
  it("should transform nothing", () => {
    const scripts = {
      start: 'node index.js',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test:vitest": "vitest"
      },
      coverage: false,
      modified: ["test:vitest"],

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
      commands: {
        start: 'node index.js',
        "test": "vitest",
        "test:integration": "vitest tests/integrations/**.spec.ts",
      },
      coverage: false,
      modified: ["test", "test:integration"],
    });
  });

  it("should transform a chained jest script", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest src/a/**.spec.ts & jest src/b/**.test.ts && jest dist/c/*.ts',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest src/a/**.spec.ts & vitest src/b/**.test.ts && vitest dist/c/*.ts",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should transform jest script with multiple arguments", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest src/a/**.spec.ts src/b/**.test.ts',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest src/a/**.spec.ts src/b/**.test.ts",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should transform jest script with flags", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest src/a/**.spec.ts --bail --silent',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest src/a/**.spec.ts --bail --silent",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should transform jest multi value flags", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest --selectProjects a b c',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest --project a --project b --project c",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should enforce specific value for special cases", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest --onlyChanged',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest --changed HEAD~1",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should be able to handle one character flags", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest -c',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest -c",
      },
      coverage: false,
      modified: ["test"],
    });
  });

  it("should be able to handle dot values", () => {
    const scripts = {
      start: 'node index.js',
      test: 'jest --collectCoverage',
    };

    const transformed = transformJestScriptsToVitest(scripts);

    expect(transformed).toStrictEqual({
      commands: {
        start: 'node index.js',
        "test": "vitest --coverage.enabled",
      },
      coverage: true,
      modified: ["test"],
    });
  });
});
