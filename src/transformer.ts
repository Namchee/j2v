import {
  type CallExpression,
  Project,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";

import { Logger } from "./logger";
import type { TestFile } from "./test";

// If the value is a string, it will just re-map to `vi.<name>`
// If the value is a function, then the function will handle all the transformation
type VitestUtil = string | ((expr: CallExpression, source: SourceFile) => void);

// List of common globals used in Jest
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
        case "advanceTimers": {
          newTimerOptions.shouldAdvanceTime = "true";

          if (!Number.isNaN(value)) {
            newTimerOptions.advanceTimeDelta = value;
          }

          break;
        }
        case "now": {
          newTimerOptions.now = value;
          break;
        }
        case "doNotFake": {
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
  advanceTimersToNextTimer: (expr: CallExpression) => {
    const args = expr.getArguments();
    let count = 1;

    if (args[0]) {
      count = Number(args[0].getText());
    }

    let newExpressionText = "vi";
    for (let i = 0; i < count; i++) {
      newExpressionText += ".advanceTimersToNextTimer()";
    }

    expr.replaceWithText(newExpressionText);
  },
  advanceTimersToNextTimerAsync: (expr: CallExpression) => {
    const args = expr.getArguments();
    let count = 1;

    if (args[0]) {
      count = Number(args[0].getText());
    }

    let newExpressionText = "vi";
    for (let i = 0; i < count; i++) {
      newExpressionText += ".advanceTimersToNextTimerAsync()";
    }

    expr.replaceWithText(newExpressionText);
  },
  getTimerCount: "getTimerCount",
  runAllTicks: "runAllTicks",
  runAllTimers: "runAllTimers",
  runAllTimersAsync: "runAllTimersAsync",
  runOnlyPendingTimers: "runOnlyPendingTimers",
  runOnlyPendingTimersAsync: "runOnlyPendingTimersAsync",
  resetAllMocks: "resetAllMocks",
  clearAllMocks: "clearAllMocks",
  restoreAllMocks: "restoreAllMocks",
  fn: "fn",
  spyOn: "spyOn",
  mock: "mock",
  doMock: "doMock",
  unmock: "unmock",
  doUnmock: "doUnmock",
  requireActual: (expr: CallExpression) => {
    const parent =
      expr.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
      expr.getFirstAncestorByKind(SyntaxKind.FunctionExpression);

    expr.setExpression("vi.importActual");
    expr.replaceWithText(`await ${expr.getText()}`);

    if (parent && !parent.hasModifier(SyntaxKind.AsyncKeyword)) {
      parent.setIsAsync(true);
    }
  },
  requireMock: (expr: CallExpression) => {
    const parent =
      expr.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
      expr.getFirstAncestorByKind(SyntaxKind.FunctionExpression);

    expr.setExpression("vi.importMock");
    expr.replaceWithText(`await ${expr.getText()}`);

    if (parent && !parent.hasModifier(SyntaxKind.AsyncKeyword)) {
      parent.setIsAsync(true);
    }
  },
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

// List of commonly used (and mappable) Jest types
const JEST_TYPES = ["Mock", "Mocked", "Replaced", "Spied"];

/**
 * Check whether the file is a Playwright test that should be skipped
 *
 * @param {string} source Source code in string
 * @returns {boolean} `true` if the source code is a Playwright test file,
 * `false` otherwise
 */
function isPlaywrightTest(source: string): boolean {
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

      if (typeof mapping === "function") {
        mapping(expression, source);
      } else {
        expression.setExpression(`vi.${mapping}`);
      }

      hasUtils = true;
    } else {
      Logger.warning(
        `j2v cannot transform \`${callExpression.getText()}\` on line ${expression.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
      );
    }
  }

  return hasUtils;
}

function transformJestTypes(source: SourceFile): string[] {
  const neededTypes = [];
  const typeRefs = source.getDescendantsOfKind(SyntaxKind.TypeReference);

  for (const typeRef of typeRefs) {
    const typeName = typeRef.getTypeName();
    const namespace = typeName.getFirstChild();
    const typeProp = typeName.getLastChild();

    if (namespace?.getText() === "jest" && typeProp) {
      if (
        JEST_TYPES.includes(typeProp.getText())
      ) {
        const typeName = typeProp.getText();

        typeProp.replaceWithText(typeName);
        neededTypes.push(typeName);
      } else {
        typeRef.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.removeType();
      }
    }
  }

  return neededTypes;
}

function removeJestImports(source: SourceFile) {
  const importDec = source.getImportDeclaration(
    (dec) => dec.getModuleSpecifierValue() === "@jest/globals",
  );

  if (importDec) {
    importDec.remove();
  }
}

export function transformJestTestToVitest(
  testFiles: TestFile[],
  useGlobals = false,
): TestFile[] {
  for (const file of testFiles) {
    Logger.debug(`Transforming ${file.path}`);

    if (isPlaywrightTest(file.content)) {
      Logger.debug(`Skipped ${file.path} as it's a Playwright-based test`);
      continue;
    }

    const project = new Project();
    const source = project.createSourceFile(file.path, file.content);

    const hasUtils = transformJestUtils(source);
    const neededTypes = transformJestTypes(source);

    const imports = hasUtils || neededTypes.length ? ["vi"] : [];

    if (!useGlobals) {
      imports.push(...getJestGlobals(source));
    }

    if (imports.length) {
      source.addImportDeclaration({
        namedImports: imports,
        moduleSpecifier: "vitest",
      });
    }

    if (neededTypes.length) {
      source.addImportDeclaration({
        namedImports: neededTypes.map((importName) => ({
          name: importName,
          isTypeOnly: true,
        })),
        moduleSpecifier: "vitest",
      });
    }

    removeJestImports(source);

    file.content = source.getFullText();

    Logger.debug(`Test file ${file.path} transformed successfully`);
  }

  return testFiles;
}
