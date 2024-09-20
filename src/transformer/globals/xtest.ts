import type { CallExpression, } from "ts-morph";

import { getChainedExpressionCalls } from "../chain";
import test from "./test";

export default function (expr: CallExpression): string {
  test(expr);

  const properties = getChainedExpressionCalls(expr);

  const tokens = ["test", "skip", ...properties.slice(1).map((p) => p.getText())];

  expr.setExpression(tokens.join("."));

  return "it";
}
