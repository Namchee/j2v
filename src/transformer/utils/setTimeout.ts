import type { CallExpression, } from "ts-morph";

export default function (expr: CallExpression): string {
  const args = expr.getArguments();

  expr.replaceWithText(
    `vi.setConfig({ testTimeout: ${args[0]?.getText()} })`,
  );

  return "vi";
}
