import type { CallExpression, } from "ts-morph";

import test from "./test";

export default function (expr: CallExpression): string {
  test(expr);

  return "it";
}
