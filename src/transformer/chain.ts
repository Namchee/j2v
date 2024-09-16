import { type CallExpression, type Identifier, SyntaxKind } from "ts-morph";

export function getChainedExpressionCalls(expr: CallExpression): Identifier[] {
  const firstChild = expr.getChildAtIndex(0);
  if (firstChild.isKind(SyntaxKind.Identifier)) {
    return [firstChild];
  }

  const parts: Identifier[] = [];

  let propExpr = expr.getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression);
  while (propExpr) {
    parts.unshift(propExpr.getLastChildByKind(SyntaxKind.Identifier) as Identifier);
    const child = propExpr.getFirstChildByKind(SyntaxKind.PropertyAccessExpression);

    if (child) {
      propExpr = child;
    } else {
      const lastIdentifier = propExpr.getChildAtIndex(0);
      parts.unshift(lastIdentifier as Identifier);
      break;
    }
  }

  return parts;
}
