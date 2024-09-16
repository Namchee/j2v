import type { CallExpression } from "ts-morph";

export default function(expr: CallExpression): string {
  expr.setExpression("vi.advanceTimersByTime");

  return "vi";
}
