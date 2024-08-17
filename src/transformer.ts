import { type CallExpression, Project, type SourceFile, SyntaxKind, } from "ts-morph";

import { Logger } from "./logger";
import type { TestFile } from "./test";

type TransformerFn = (source: SourceFile, expr: CallExpression) => void;

const JEST_GLOBALS = ['afterAll', 'afterEach', 'beforeAll', 'beforeEach', 'describe', 'test', 'it', 'expect'];
const TRANSFORMER: Record<string, TransformerFn> = {
  mocked: (source: SourceFile, expr: CallExpression) => {
    expr.setExpression('vi.mocked');

    const args = expr.getArguments();
    if (args.length !== 2) {
      return;
    }

    if (args[1]?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      Logger.warning(`j2v cannot transform \`jest.mocked\` on line ${expr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it manually`);
    }

    const props = args[1]?.getChildrenOfKind(SyntaxKind.PropertyAssignment);
    if (!props) {
      return;
    }

    for (const prop of props) {
      const identifier = prop.getFirstChildByKind(SyntaxKind.Identifier);

      if (identifier?.getText() === 'shallow') {
        const value = args[1]?.getChildrenOfKind(SyntaxKind.FalseKeyword);

        expr.insertArgument(1, value?.length ? 'true' : 'false');
        expr.removeArgument(2);
      }
    }
  }
}

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

  for (const expression of expressions) {
    const callExpression = expression.getFirstChildIfKind(SyntaxKind.PropertyAccessExpression);

    if (!callExpression) {
      continue;
    }

    const callChildren = callExpression.getChildren();
    const sourceObject = callChildren[0];
    const method = callChildren[2];

    if (sourceObject?.getText() !== 'jest' || !method) {
      continue;
    }

    const fn = TRANSFORMER[method.getText()];

    if (fn) {
      fn(source, expression);
    } else {
      expression.setExpression(`vi.${method.getText()}`);
    }

    hasUtils = true;
  }

  return hasUtils;
}

function addImportDeclaration(source: SourceFile, globals: string[]) {
  source.addImportDeclaration({
    namedImports: globals,
    moduleSpecifier: 'vitest',
  });
}

export function transformJestTestToVitest(testFiles: TestFile[], useGlobals = false) {
  for (const file of testFiles) {
    if (isPlaywrightTest(file.content)) {
      continue;
    }

    const project = new Project();
    const source = project.createSourceFile(file.path, file.content);

    const globals = getJestGlobals(source);
    const hasUtils = transformJestUtils(source);

    if (hasUtils) {
      globals.push('vi');
    }

    if (!useGlobals) {
      addImportDeclaration(source, globals);
    }
  }
}

const path = 'some/random/path.ts';
const content = `describe('arithmetic', () => {
  beforeAll(() => {
    console.log("I'm executed before all!");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return 2', () => {
    const result = 1 + 1;
    const a = true;

    const b = { shallow: true };
    const spy = jest.spyOn(video, 'play');
    const mocked = jest.mocked(video, b);
    const sample = jest.mocked(video, { shallow: true });

    const c = jest.mocked(video);

    jest.mocked(song, { })
    expect(result).toBe(2);
  });
});
`;

transformJestTestToVitest([{ path, content }]);
