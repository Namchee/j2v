import type { CallExpression } from "ts-morph";

export default function (expr: CallExpression): string {
  expr.setExpression("describe.skip");

  return "describe";
}
