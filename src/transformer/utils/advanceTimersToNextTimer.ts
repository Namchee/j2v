import type { CallExpression } from "ts-morph";

export default function (expr: CallExpression): string {
  const args = expr.getArguments();
  let count = 1;

  if (args[0]) {
    count = Number(args[0].getText());
  }

  let newExpressionText = "vi";
  for (let i = 0; i < count; i++) {
    newExpressionText += ".advanceTimersToNextTimer()";
  }

  expr.replaceWithText(newExpressionText);

  return "vi";
}
