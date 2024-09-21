import {
  type CallExpression,
  IndentationText,
  Project,
  QuoteKind,
  ScriptKind,
  type SourceFile,
  type StringLiteral,
  SyntaxKind,
  type TypeReferenceNode,
} from "ts-morph";

import { getChainedExpressionCalls } from "./transformer/chain";
import { JEST_GLOBALS } from "./transformer/globals";
import { JEST_TYPES } from "./transformer/types";
import { JEST_UTILITIES } from "./transformer/utils";

import { Logger } from "./logger";

import { extname } from "node:path";
import type { UserConfig } from "vitest/config";
import type { TestFile } from "./fs";

export type CallExpressionReplacer = (
  expr: CallExpression,
  source: SourceFile,
) => string;

function transformCallExpression(
  callExpr: CallExpression,
  source: SourceFile,
): string | undefined {
  const propertyChain = getChainedExpressionCalls(callExpr);

  if (propertyChain[0] && JEST_GLOBALS[propertyChain[0].getText()]) {
    const mappedProp = JEST_GLOBALS[
      propertyChain[0].getText()
    ] as CallExpressionReplacer;

    return mappedProp(callExpr, source);
  }

  return transformJestAPI(callExpr, source);
}

function transformJestAPI(
  callExpr: CallExpression,
  source: SourceFile,
): string | undefined {
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

  if (JEST_UTILITIES[method.getText()]) {
    const methodName = method.getText();
    const transformer = JEST_UTILITIES[methodName] as CallExpressionReplacer;

    return transformer(callExpr, source);
  }

  Logger.warning(
    `j2v cannot transform \`${propertyExpr.getText()}\` on line ${callExpr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
  );
}

function transformTypeReference(
  typeRef: TypeReferenceNode,
): string | undefined {
  const typeName = typeRef.getTypeName();
  const namespace = typeName.getFirstChild()?.getText();
  const typeProp = typeName.getLastChild()?.getText() as string;

  if (namespace === "jest" && JEST_TYPES.includes(typeProp)) {
    typeName.replaceWithText(typeProp);

    return typeProp;
  }

  typeRef.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.removeType();
}

function transformWorkerID(node: StringLiteral) {
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

function getIndentation(source: SourceFile): IndentationText {
  const lines = source.getFullText().split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length) {
      const leadingSpaces = /^\s+/.exec(trimmedLine);
      if (leadingSpaces?.includes("\t")) {
        return IndentationText.Tab;
      }

      if (leadingSpaces?.length === 2) {
        return IndentationText.TwoSpaces;
      }

      if (leadingSpaces?.length === 4) {
        return IndentationText.FourSpaces;
      }

      return IndentationText.EightSpaces;
    }
  }

  return IndentationText.TwoSpaces;
}

function getQuote(source: SourceFile): QuoteKind {
  const stringSample = source.getFirstDescendantByKind(
    SyntaxKind.StringLiteral,
  );
  if (!stringSample) {
    return QuoteKind.Single;
  }

  return stringSample.getText().startsWith('"')
    ? QuoteKind.Double
    : QuoteKind.Single;
}

function getScriptKind(path: string): ScriptKind {
  const ext = extname(path);

  switch (ext) {
    case ".js":
      return ScriptKind.JS;
    case ".cjs":
      return ScriptKind.JS;
    case ".mjs":
      return ScriptKind.JS;
    case ".jsx":
      return ScriptKind.JSX;
    case ".ts":
      return ScriptKind.TS;
    case ".cts":
      return ScriptKind.TS;
    case ".mts":
      return ScriptKind.TS;
    case ".tsx":
      return ScriptKind.TSX;
    default:
      return ScriptKind.Unknown;
  }
}

export function transformJestTestToVitest(
  testFiles: TestFile[],
  config: UserConfig["test"],
): TestFile[] {
  const project = new Project();

  for (const file of testFiles) {
    Logger.debug(`Transforming ${file.path}`);

    const source = project.createSourceFile(file.path, file.content, {
      overwrite: true,
      scriptKind: getScriptKind(file.path),
    });

    const types: string[] = [];
    const api: string[] = [];

    source.forEachDescendant((node) => {
      switch (node.getKind()) {
        case SyntaxKind.CallExpression: {
          const apiCall = transformCallExpression(
            node as CallExpression,
            source,
          );

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

        case SyntaxKind.Identifier: {
          // https://vitest.dev/guide/migration.html#envs
          if (node.getText() === "JEST_WORKER_ID") {
            node.replaceWithText("VITEST_POOL_ID");
          }

          break;
        }

        case SyntaxKind.StringLiteral: {
          transformWorkerID(node as StringLiteral);

          break;
        }
      }
    });

    if (!config?.globals && api.length) {
      source.addImportDeclaration({
        namedImports: [...new Set(api)].sort(),
        moduleSpecifier: "vitest",
      });
    }

    if (types.length) {
      source.addImportDeclaration({
        namedImports: types
          .map((importName) => ({
            name: importName,
            isTypeOnly: true,
          }))
          .sort(),
        moduleSpecifier: "vitest",
      });
    }

    removeJestImports(source);

    source.formatText({
      ensureNewLineAtEndOfFile: true,
    });
    file.content = source.getFullText();
    source.forget();

    Logger.debug(`Test file ${file.path} transformed successfully`);
  }

  return testFiles;
}
