import { type CallExpression, SyntaxKind } from "ts-morph";

export default function (expr: CallExpression): string {
  const parent =
    expr.getFirstAncestorByKind(SyntaxKind.ArrowFunction) ||
    expr.getFirstAncestorByKind(SyntaxKind.FunctionExpression);

  expr.setExpression("vi.importActual");
  expr.replaceWithText(`await ${expr.getText()}`);

  if (parent && !parent.hasModifier(SyntaxKind.AsyncKeyword)) {
    parent.setIsAsync(true);
  }

  return "vi";
}
