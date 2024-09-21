import type { CallExpression, } from "ts-morph";

import { Logger } from "../../logger";

export default function (expr: CallExpression): string {
  Logger.warning(
    `Vitest doesn't support \`jest.enableAutomock\` API declared on line ${expr.getStartLineNumber(true)}. If you want to keep the automocking behavior, please register all of them as a setup file.`,
  );

  return "";
}
