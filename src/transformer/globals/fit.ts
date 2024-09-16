import type { CallExpression, } from "ts-morph";

import { getChainedExpressionCalls } from "../chain";
import test from "./test";

export default function (expr: CallExpression): string {
  test(expr);

  const properties = getChainedExpressionCalls(expr);

  expr.setExpression(`it.only.${properties.slice(1).map(p => p.getText()).join('.')}`);

  return "it";
}
