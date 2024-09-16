import { type CallExpression, SyntaxKind } from "ts-morph";

export default function (expr: CallExpression): string {
  expr.setExpression("vi.mock");

  const args = expr.getArguments();
  if (args.length === 1) {
    return "vi";
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
      return "vi";
    }

    const returnObj = factoryFn?.getLastChild();
    if (returnObj) {
      returnObj.replaceWithText(`({
  default: ${returnObj.getText()}
})`);
    }
  }

  return "vi";
}
