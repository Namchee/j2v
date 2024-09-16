import type { CallExpression } from "ts-morph";

import afterAll from "./afterAll";

export default function(expr: CallExpression): string {
  // same replacer, different import
  afterAll(expr);

  return "beforeEach";
}
