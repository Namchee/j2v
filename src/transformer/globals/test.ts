import { type CallExpression, SyntaxKind } from "ts-morph";

import { getChainedExpressionCalls } from "../chain";

export default function (expr: CallExpression): string {
  const properties = getChainedExpressionCalls(expr);
  if (properties[1]?.getText() === "failing") {
    properties[1].replaceWithText("fails");
  }

  const fn = expr.getArguments()[1];
  if (!fn?.isKind(SyntaxKind.ArrowFunction)) {
    return "test";
  }

  const actualTest = fn.asKind(SyntaxKind.ArrowFunction);
  const params = actualTest?.getParameters();
  if (!params || params.length === 0) {
    return "test";
  }

  const body = actualTest?.getBody().getText();

  actualTest?.replaceWithText(
    `() => new Promise((${params.map((p) => p.getText()).join(", ")}) => ${body} )`,
  );

  return "test";
}
