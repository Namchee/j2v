import {
  type CallExpression,
  IndentationText,
  Project,
  QuoteKind,
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

      return;
    }

    const rawArgObject = args.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    const props = rawArgObject.getProperties();

    for (const prop of props) {
      const key = prop.getChildAtIndex(0).getText();
      const value = prop.getChildAtIndex(2).getText();

      switch (key) {
        case "advanceTimers": {
          rawArgObject.addPropertyAssignment({
            name: "shouldAdvanceTime",
            initializer: "true",
          });

          const tryNumber = Number(value.replace(/_/g, ""));

          if (!Number.isNaN(tryNumber)) {
            rawArgObject.addPropertyAssignment({
              name: "advanceTimeDelta",
              initializer: value,
            });
          }

          prop.remove();

          break;
        }
        case "now": {
          break;
        }
        case "doNotFake": {
          const jestTimerMethods = JSON.parse(value.replace(/[`']/g, '"'));

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

          const vitestTimerMethods = mockedByJest.filter(
            (method) => !jestTimerMethods.includes(method),
          );

          rawArgObject.addPropertyAssignment({
            name: "toFake",
            initializer: JSON.stringify(vitestTimerMethods, null, 2),
          });
          prop.remove();

          break;
        }
        case "timerLimit": {
          rawArgObject.addPropertyAssignment({
            name: "loopLimit",
            initializer: value,
          });

          prop.remove();

          break;
        }
        default: {
          prop.remove();
          break;
        }
      }
    }
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
  // TODO: please confirm to Vitest team about returning primitives from a block
  mock: (expr: CallExpression) => {
    expr.setExpression("vi.mock");

    const args = expr.getArguments();
    if (args.length === 1) {
      return;
    }

    const factoryArgs = args[1];

    if (factoryArgs) {
      const factoryFn = factoryArgs.asKind(SyntaxKind.ArrowFunction) || factoryArgs.asKind(SyntaxKind.FunctionExpression);
      const isNotPrimitive = factoryFn?.getChildrenOfKind(SyntaxKind.Block).length || factoryFn?.getChildrenOfKind(SyntaxKind.ParenthesizedExpression).length;

      if (isNotPrimitive) {
        return;
      }

      const returnObj = factoryFn?.getLastChild();
      if (returnObj) {
        returnObj.replaceWithText(`({
  default: ${returnObj.getText()}
})`);
      }
    }
  },
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

    expr.replaceWithText(
      `vi.setConfig({ testTimeout: ${args[0]?.getText()} })`,
    );
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

      return;
    }

    const props = args[1]?.getChildrenOfKind(SyntaxKind.PropertyAssignment);
    if (!props) {
      return;
    }

    for (const prop of props) {
      const identifier = prop.getFirstChildByKind(SyntaxKind.Identifier);

      if (identifier?.getText() === "shallow") {
        const value = prop.getChildrenOfKind(SyntaxKind.FalseKeyword);

        expr.insertArgument(1, value?.length ? "true" : "false");
        expr.removeArgument(2);
      }
    }
  },
  enableAutomock: (expr: CallExpression) => {
    Logger.warning(
      `Vitest doesn't support \`jest.enableAutomock\` API declared on line ${expr.getStartLineNumber(true)}. If you want to keep the automocking behavior, please register all of them as a setup file`,
    );
  },
  disableAutomock: (expr: CallExpression) => {
    Logger.warning(
      `Vitest doesn't support \`jest.disableAutomock\` API declared on line ${expr.getStartLineNumber(true)}. If you want to keep the automocking behavior, please register all of them as a setup file`,
    );
  },
};

// List of commonly used (and mappable) Jest types
const JEST_TYPES = {
  Mock: "Mock",
  Mocked: "Mocked",
  Replaced: "Replaced",
  Spied: "Spied",
};

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

function transformCallExpression(
  callExpr: CallExpression,
  source: SourceFile,
): boolean {
  const propertyExpr = callExpr.getFirstChildIfKind(
    SyntaxKind.PropertyAccessExpression,
  );

  if (!propertyExpr) {
    return false;
  }

  const callChildren = propertyExpr.getChildren();
  const sourceObject = callChildren[0];
  const method = callChildren[2];

  if (sourceObject?.getText() !== "jest" || !method) {
    return false;
  }

  if (JEST_UTILS[method.getText()]) {
    const mapping = JEST_UTILS[method.getText()];

    if (typeof mapping === "function") {
      mapping(callExpr, source);
    } else {
      callExpr.setExpression(`vi.${mapping}`);
    }

    return true;
  }

  Logger.warning(
    `j2v cannot transform \`${propertyExpr.getText()}\` on line ${callExpr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
  );

  return false;
}

function transformJestUtils(source: SourceFile): boolean {
  let hasUtils = false;

  source.forEachDescendant((node) => {
    switch (node.getKind()) {
      case SyntaxKind.CallExpression:
        hasUtils = transformCallExpression(node as CallExpression, source);
        break;
    }
  });

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
      if (typeProp.getText() in JEST_TYPES) {
        const typeName = typeProp.getText();

        typeProp.replaceWithText(typeName);
        neededTypes.push(typeName);
      } else {
        typeRef
          .getFirstAncestorByKind(SyntaxKind.VariableDeclaration)
          ?.removeType();
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

    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        quoteKind: QuoteKind.Single,
      },
    });
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
