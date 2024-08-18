import {
  type CallExpression,
  Project,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";

import { Logger } from "./logger";
import type { TestFile } from "./test";

type VitestUtil = string | ((expr: CallExpression, source: SourceFile) => void);

const JEST_GLOBALS = [
  "afterAll",
  "afterEach",
  "beforeAll",
  "beforeEach",
  "describe",
  "test",
  "it",
  "expect",
];
const JEST_UTILS: Record<string, VitestUtil> = {
  useFakeTimers: (expr: CallExpression, source: SourceFile) => {
    expr.setExpression("vi.useFakeTimers");

    const args = expr.getArguments()[0];
    if (!args) {
      return;
    }

    if (args.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      Logger.warning(
        `j2v cannot transform \`jest.useFakeTimers\` on line ${expr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
      );
    }

    const props = args.getChildrenOfKind(SyntaxKind.PropertyAssignment);
    const newTimerOptions: Record<string, unknown> = {};

    for (const prop of props) {
      const value = prop.getChildAtIndex(1).getText();

      switch (prop.getText()) {
        case 'advanceTimers': {
          newTimerOptions.shouldAdvanceTime = 'true';

          if (!Number.isNaN(value)) {
            newTimerOptions.advanceTimeDelta = value;
          }

          break;
        }
        case 'now': {
          newTimerOptions.now = value;
          break;
        }
        case 'doNotFake': {
          // https://jestjs.io/docs/jest-object#fake-timers
          const mockedByJest = [
            "Date",
            "hrtime",
            "nextTick",
            "performance",
            "queueMicrotask",
            "requestAnimationFrame",
            "cancelAnimationFrame",
            "requestIdleCallback",
            "cancelIdleCallback",
            "setImmediate",
            "clearImmediate",
            "setInterval",
            "clearInterval",
            "setTimeout",
            "clearTimeout",
          ];

          newTimerOptions.toFake = mockedByJest.filter(
            (method) => !JSON.parse(value).includes(method),
          );
          break;
        }
      }
    }

    expr.insertArgument(0, JSON.stringify(newTimerOptions));
    expr.removeArgument(1);
  },
  useRealTimers: "useRealTimers",
  clearAllTimers: "clearAllTimers",
  advanceTimersByTime: "advanceTimersByTime",
  advanceTimersByTimeAsync: "advanceTimersByTimeAsync",
  resetAllMocks: "resetAllMocks",
  clearAllMocks: "clearAllMocks",
  restoreAllMocks: "restoreAllMocks",
  fn: "fn",
  spyOn: "spyOn",
  mock: "mock",
  unmock: "unmock",
  requireActual: "importActual",
  requireMock: "importMock",
  resetModules: "resetModules",
  isMockFunction: "isMockFunction",
  setTimeout: (expr: CallExpression) => {
    const args = expr.getArguments();

    expr.setExpression(`vi.setConfig({ testTimeout: ${args[0]?.getText()} }})`);
  },
  mocked: (expr: CallExpression, source: SourceFile) => {
    expr.setExpression("vi.mocked");

    const args = expr.getArguments();
    if (args.length !== 2) {
      return;
    }

    if (args[1]?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      Logger.warning(
        `j2v cannot transform \`jest.mocked\` on line ${expr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
      );
    }

    const props = args[1]?.getChildrenOfKind(SyntaxKind.PropertyAssignment);
    if (!props) {
      return;
    }

    for (const prop of props) {
      const identifier = prop.getFirstChildByKind(SyntaxKind.Identifier);

      if (identifier?.getText() === "shallow") {
        const value = args[1]?.getChildrenOfKind(SyntaxKind.FalseKeyword);

        expr.insertArgument(1, value?.length ? "true" : "false");
        expr.removeArgument(2);
      }
    }
  },
};
const JEST_TYPES = ["Mock", "Mocked", "Replaced", "Spied"];

function isPlaywrightTest(source: string) {
  return /'@playwright\/test'/.test(source);
}

function getJestGlobals(source: SourceFile): string[] {
  const globals = [];
  const expressions = source.getDescendantsOfKind(SyntaxKind.CallExpression);

  for (const expression of expressions) {
    const identifier = expression.getChildrenOfKind(SyntaxKind.Identifier);

    if (identifier[0] && JEST_GLOBALS.includes(identifier[0].getText())) {
      globals.push(identifier[0].getText());
    }
  }

  return globals;
}

function transformJestUtils(source: SourceFile): boolean {
  let hasUtils = false;
  const expressions = source.getDescendantsOfKind(SyntaxKind.CallExpression);

  console.log('here');

  for (const expression of expressions) {
    const callExpression = expression.getFirstChildIfKind(
      SyntaxKind.PropertyAccessExpression,
    );

    if (!callExpression) {
      continue;
    }

    const callChildren = callExpression.getChildren();
    const sourceObject = callChildren[0];
    const method = callChildren[2];

    if (sourceObject?.getText() !== "jest" || !method) {
      continue;
    }

    if (JEST_UTILS[method.getText()]) {
      const mapping = JEST_UTILS[method.getText()];

      if (typeof mapping === 'function') {
        mapping(expression, source);
      } else {
        expression.setExpression(`vi.${mapping}`);
      }

      hasUtils = true;
    } else {
      const parent = expression.getParent();
      if (parent) {
        source.removeText();
      }
    }
  }

  return hasUtils;
}

function transformJestTypes(source: SourceFile): boolean {
  let hasJestTypes = false;
  const typeRefs = source.getDescendantsOfKind(SyntaxKind.TypeReference);

  for (const typeRef of typeRefs) {
    const typeName = typeRef.getTypeName();
    const namespace = typeName.getFirstChild();
    const typeProp = typeName.getLastChild();

    if (namespace?.getText() === 'jest' && typeProp && JEST_TYPES.includes(typeProp.getText())) {
      typeName.replaceWithText(`vi.${typeProp.getText()}`);
      hasJestTypes = true;
    }
  }

  return hasJestTypes;
};

function addImportDeclaration(source: SourceFile, globals: string[]) {
  source.addImportDeclaration({
    namedImports: globals,
    moduleSpecifier: "vitest",
  });
}

export function transformJestTestToVitest(
  testFiles: TestFile[],
  useGlobals = false,
) {
  for (const file of testFiles) {
    if (isPlaywrightTest(file.content)) {
      Logger.debug(`Skipped ${file.path} as it's a Playwright-based test`);
      continue;
    }

    const project = new Project();
    const source = project.createSourceFile(file.path, file.content);

    const hasUtils = transformJestUtils(source);
    const hasTypes = transformJestTypes(source);

    const imports = hasUtils || hasTypes
      ? ["vi"]
      : [];

    if (!useGlobals) {
      imports.push(...getJestGlobals(source));
    }

    if (imports.length) {
      addImportDeclaration(source, imports);
    }
  }
}

const path = "some/random/path.ts";
const content = `import {expect, jest, test} from '@jest/globals';
import type {fetch} from 'node-fetch';

jest.mock('node-fetch');

let mockedFetch: jest.Mocked<typeof fetch>;

afterEach(() => {
  mockedFetch.mockClear();
});

test('makes correct call', () => {
  mockedFetch = getMockedFetch();
  // ...
});

test('returns correct data', () => {
  mockedFetch = getMockedFetch();
  // ...
});`;

transformJestTestToVitest([{ path, content }]);
