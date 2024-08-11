import { Project, type SourceFile, SyntaxKind } from "ts-morph";

import type { TestFile } from "./test";

type VitestUtil = {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: options cannot be typed
  fn?: (args: any[]) => string;
}

const JEST_GLOBALS = ['afterAll', 'afterEach', 'beforeAll', 'beforeEach', 'describe', 'test', 'it', 'expect'];
const JEST_UTILS: Record<string, VitestUtil> = {
  fn: {
    name: 'fn',
  },
  spyOn: {
    name: 'spyOn'
  },
  clearAllMocks: {
    name: 'clearAllMocks'
  },
  resetAllMocks: {
    name: 'resetAllMocks',
  },
  restoreAllMocks: {
    name: 'restoreAllMocks',
  },
  mocked: {
    name: 'mocked',
    // biome-ignore lint/suspicious/noExplicitAny: cannot be typed
    fn: (args: any[]) => {
      args[1] = !!args[1]?.shallow;
      return args;
    },
  },
  useFakeTimers: {
    name: 'useFakeTimers',
  },
  useRealTimers: {
    name: 'useRealTimers',
  },
};

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
  const expressions = source.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

  for (const expression of expressions) {
    const identifiers = expression.getChildrenOfKind(SyntaxKind.Identifier);
    const object = identifiers[0];
    const prop = identifiers[1];

    if (object?.getText() === 'jest' && prop && prop.getText() in JEST_UTILS) {
      const mapped = JEST_UTILS[prop.getText()];
      const args = expression.getNextSiblings();
      hasUtils = true;

      expression.setExpression(`vi.${mapped?.name}(${mapped?.fn ? mapped.fn().join(', ') : })`)
    }
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

    expect(result).toBe(2);
  });
});
`;

transformJestTestToVitest([{ path, content }]);
