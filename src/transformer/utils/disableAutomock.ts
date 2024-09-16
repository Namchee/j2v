import { type CallExpression, SyntaxKind, } from "ts-morph";

export default function (expr: CallExpression): string {
  expr.getParent()?.asKind(SyntaxKind.ExpressionStatement)?.remove();

  return "";
}
