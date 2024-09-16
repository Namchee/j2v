import { type CallExpression, SyntaxKind } from "ts-morph";

export default function (expr: CallExpression): string {
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

  return "afterAll";
}
