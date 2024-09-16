import { type CallExpression, type SourceFile, SyntaxKind, } from "ts-morph";

import { Logger } from "../../logger";

export default function (expr: CallExpression, source: SourceFile): string {
  expr.setExpression("vi.mocked");

  const args = expr.getArguments();
  if (args.length !== 2) {
    return "vi";
  }

  if (args[1]?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
    Logger.warning(
      `j2v cannot transform \`jest.mocked\` on line ${expr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
    );

    return "vi";
  }

  const props = args[1]?.getChildrenOfKind(SyntaxKind.PropertyAssignment);
  if (!props) {
    return "vi";
  }

  for (const prop of props) {
    const identifier = prop.getFirstChildByKind(SyntaxKind.Identifier);

    if (identifier?.getText() === "shallow") {
      const value = prop.getChildrenOfKind(SyntaxKind.FalseKeyword);

      expr.insertArgument(1, value?.length ? "true" : "false");
      expr.removeArgument(2);
    }
  }

  return "vi";
}
