import {
  type CallExpression,
  IndentationText,
  Project,
  type PropertyAccessExpression,
  QuoteKind,
  type SourceFile,
  type StringLiteral,
  SyntaxKind,
  type TypeReferenceNode,
} from "ts-morph";

import { Logger } from "./logger";

import type { UserConfig } from "vitest/config";
import type { TestFile } from "./test";

// If the value is a string, it will just re-map to `vi.<name>`
// If the value is a function, then the function will handle all the transformation
type Replacer = string | ((expr: CallExpression, source: SourceFile) => void);

// List of common globals used in Jest
const JEST_GLOBALS: Record<string, Replacer> = {
  afterAll: (expr: CallExpression) => {
    const arg = expr.getArguments()[0];

    if (arg?.isKind(SyntaxKind.ArrowFunction)) {
      const arrowFn = arg.asKind(SyntaxKind.ArrowFunction);
      if (arrowFn && !arrowFn.getBody().isKind(SyntaxKind.Block)) {
        const body = arrowFn.getBody().getText();

        arrowFn.replaceWithText(`() => {
  ${body};
}`);
      }
    }
  },
  afterEach: (expr: CallExpression) => {
    const arg = expr.getArguments()[0];

    if (arg?.isKind(SyntaxKind.ArrowFunction)) {
      const arrowFn = arg.asKind(SyntaxKind.ArrowFunction);
      if (arrowFn && !arrowFn.getBody().isKind(SyntaxKind.Block)) {
        const body = arrowFn.getBody().getText();

        arrowFn.replaceWithText(`() => {
  ${body};
}`);
      }
    }
  },
  beforeAll: (expr: CallExpression) => {
    const arg = expr.getArguments()[0];

    if (arg?.isKind(SyntaxKind.ArrowFunction)) {
      const arrowFn = arg.asKind(SyntaxKind.ArrowFunction);
      if (arrowFn && !arrowFn.getBody().isKind(SyntaxKind.Block)) {
        const body = arrowFn.getBody().getText();

        arrowFn.replaceWithText(`() => {
  ${body};
}`);
      }
    }
  },
  beforeEach: (expr: CallExpression) => {
    const arg = expr.getArguments()[0];

    if (arg?.isKind(SyntaxKind.ArrowFunction)) {
      const arrowFn = arg.asKind(SyntaxKind.ArrowFunction);
      if (arrowFn && !arrowFn.getBody().isKind(SyntaxKind.Block)) {
        const body = arrowFn.getBody().getText();

        arrowFn.replaceWithText(`() => {
  ${body};
}`);
      }
    }
  },
  describe: "describe",
  test: (expr: CallExpression) => {
    const fn = expr.getArguments()[1];
    if (!fn?.isKind(SyntaxKind.ArrowFunction)) {
      return;
    }

    const actualTest = fn.asKind(SyntaxKind.ArrowFunction);
    const params = actualTest?.getParameters();
    if (!params || params.length === 0) {
      return;
    }

    const body = actualTest?.getBody().getText();
    const identifier = params[0]?.getText() as string;

    actualTest?.replaceWithText(`() => new Promise(${identifier} => ${body} )`);
    actualTest?.getParameter(identifier)?.remove();
  },
  it: (expr: CallExpression) => {
    const fn = expr.getArguments()[1];
    if (!fn?.isKind(SyntaxKind.ArrowFunction)) {
      return;
    }

    const actualTest = fn.asKind(SyntaxKind.ArrowFunction);
    const params = actualTest?.getParameters();
    if (!params || params.length === 0) {
      return;
    }

    const body = actualTest?.getBody().getText();
    const identifier = params[0]?.getText() as string;

    actualTest?.replaceWithText(`() => new Promise(${identifier} => ${body} )`);
    actualTest?.getParameter(identifier)?.remove();
  },
  fit: (expr: CallExpression) => {
    expr.setExpression('it.only');
  },
  expect: "expect",
};

const JEST_UTILS: Record<string, Replacer> = {
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
      const factoryFn =
        factoryArgs.asKind(SyntaxKind.ArrowFunction) ||
        factoryArgs.asKind(SyntaxKind.FunctionExpression);
      const isNotPrimitive =
        factoryFn?.getChildrenOfKind(SyntaxKind.Block).length ||
        factoryFn?.getChildrenOfKind(SyntaxKind.ParenthesizedExpression).length;

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
    expr.getParent()?.asKind(SyntaxKind.ExpressionStatement)?.remove();
  },
};

const JEST_PROPERTIES: Record<string, Record<string, string> > = {
  test: {
    failing: 'fails',
  },
  it: {
    failing: 'fails',
  }
}

// List of commonly used (and mappable) Jest types
const JEST_TYPES = [
  "Mock",
  "Mocked",
  "Replaced",
  "Spied",
  "Mock",
  "MockContext",
  "MockInstance",
  "MockedObject",
  "MockedFunction",
  "MockedClass",
];

function transformCallExpression(
  callExpr: CallExpression,
  source: SourceFile,
): string | undefined {
  const identifiers = callExpr.getChildrenOfKind(SyntaxKind.Identifier).map(id => id.getText());

  if (identifiers[0] && identifiers[0] in JEST_GLOBALS) {
    const mappingFn = JEST_GLOBALS[identifiers[0]];

    if (typeof mappingFn === "function") {
      mappingFn(callExpr, source);
    } else {
      callExpr.setExpression(mappingFn as string);
    }

    return identifiers[0] === "fit" ? "it" : identifiers[0];
  }

  return transformJestAPI(callExpr, source);
}

function transformJestAPI(callExpr: CallExpression, source: SourceFile): string | undefined {
  const propertyExpr = callExpr.getFirstChildIfKind(
    SyntaxKind.PropertyAccessExpression,
  );

  if (!propertyExpr) {
    return;
  }

  const callChildren = propertyExpr.getChildren();
  const sourceObject = callChildren[0];
  const method = callChildren[2];

  if (sourceObject?.getText() !== "jest" || !method) {
    return;
  }

  if (JEST_UTILS[method.getText()]) {
    const methodName = method.getText();
    const mapping = JEST_UTILS[methodName];

    if (typeof mapping === "function") {
      mapping(callExpr, source);
    } else {
      callExpr.setExpression(`vi.${mapping}`);
    }

    return methodName.includes("Automock") ? undefined : "vi";
  }

  Logger.warning(
    `j2v cannot transform \`${propertyExpr.getText()}\` on line ${callExpr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
  );
}

function transformPropertyAccessExpression(propExpr: PropertyAccessExpression) {
  const identifiers = propExpr.getChildrenOfKind(SyntaxKind.Identifier);
  if (identifiers[0] && JEST_PROPERTIES[identifiers[0].getText()]) {
    const mapping = JEST_PROPERTIES[identifiers[0].getText()] as Record<string, string>;

    for (let idx = 1; idx < identifiers.length; idx++) {
      const identifier = identifiers[idx]?.getText();

      if (identifier && mapping[identifier]) {
        identifiers[idx]?.replaceWithText(mapping[identifier]);
      }
    }
  }
}

function transformTypeReference(typeRef: TypeReferenceNode): string | undefined {
  const typeName = typeRef.getTypeName();
  const namespace = typeName.getFirstChild()?.getText();
  const typeProp = typeName.getLastChild()?.getText() as string;

  if (namespace === "jest" && JEST_TYPES.includes(typeProp)) {
    typeName.replaceWithText(typeProp);

    return typeProp;
  }

  typeRef.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.removeType();
}

function transformStringLiteral(node: StringLiteral) {
  const workerIdPattern = /(['"`])JEST_WORKER_ID\1/;
  const match = node.getText().match(workerIdPattern);

  if (match) {
    const quote = match[1];
    node.replaceWithText(`${quote}VITEST_POOL_ID${quote}`);
  }
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
  config: UserConfig["test"],
): TestFile[] {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      quoteKind: QuoteKind.Single,
    },
  });

  for (const file of testFiles) {
    Logger.debug(`Transforming ${file.path}`);

    const source = project.createSourceFile(file.path, file.content);

    const types: string[] = [];
    const api: string[] = [];

    source.forEachDescendant((node) => {
      switch (node.getKind()) {
        case SyntaxKind.CallExpression: {
          const apiCall = transformCallExpression(node as CallExpression, source);

          if (apiCall) {
            api.push(apiCall);
          }

          break;
        }

        case SyntaxKind.TypeReference: {
          const jestTypes = transformTypeReference(node as TypeReferenceNode);
          if (jestTypes) {
            types.push(jestTypes);
          }

          break;
        }

        case SyntaxKind.PropertyAccessExpression: {
          transformPropertyAccessExpression(node as PropertyAccessExpression);

          break;
        }

        case SyntaxKind.Identifier: {
          // https://vitest.dev/guide/migration.html#envs
          if (node.getText() === "JEST_WORKER_ID") {
            node.replaceWithText("VITEST_POOL_ID");
          }

          break;
        }

        case SyntaxKind.StringLiteral: {
          transformStringLiteral(node as StringLiteral);

          break;
        }
      }
    });

    if (!config?.globals && api.length) {
      source.addImportDeclaration({
        namedImports: [...new Set(api)],
        moduleSpecifier: "vitest",
      });
    }

    if (types.length) {
      source.addImportDeclaration({
        namedImports: types.map((importName) => ({
          name: importName,
          isTypeOnly: true,
        })),
        moduleSpecifier: "vitest",
      });
    }

    removeJestImports(source);

    source.formatText();
    file.content = source.getFullText();
    source.forget();

    Logger.debug(`Test file ${file.path} transformed successfully`);
  }

  return testFiles;
}
