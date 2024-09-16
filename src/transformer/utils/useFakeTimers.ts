import { type CallExpression, type SourceFile, SyntaxKind } from "ts-morph";

import { Logger } from "./../../logger";

export default function(expr: CallExpression, source: SourceFile): string {
  expr.setExpression("vi.useFakeTimers");

    const args = expr.getArguments()[0];
    if (!args) {
      return "vi";
    }

    if (args.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      Logger.warning(
        `j2v cannot transform \`jest.useFakeTimers\` on line ${expr.getStartLineNumber(true)} in \`${source.getBaseName()}\` correctly. You might want to transform it to Vitest equivalent manually`,
      );

      return "vi";
    }

    const rawArgObject = args.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    const props = rawArgObject.getProperties();

    for (const prop of props) {
      const key = prop.getChildAtIndex(0).getText();
      const value = prop.getChildAtIndex(2).getText();

      switch (key) {
        case "advanceTimers": {
          rawArgObject.addPropertyAssignment({
            name: "shouldAdvanceTime",
            initializer: "true",
          });

          const tryNumber = Number(value.replace(/_/g, ""));

          if (!Number.isNaN(tryNumber)) {
            rawArgObject.addPropertyAssignment({
              name: "advanceTimeDelta",
              initializer: value,
            });
          }

          prop.remove();

          break;
        }
        case "now": {
          break;
        }
        case "doNotFake": {
          const jestTimerMethods = JSON.parse(value.replace(/[`']/g, '"'));

          // https://jestjs.io/docs/jest-object#fake-timers
          const mockedByJest = [
            "Date",
            "hrtime",
            "nextTick",
            "performance",
            "queueMicrotask",
            "requestAnimationFrame",
            "cancelAnimationFrame",
            "requestIdleCallback",
            "cancelIdleCallback",
            "setImmediate",
            "clearImmediate",
            "setInterval",
            "clearInterval",
            "setTimeout",
            "clearTimeout",
          ];

          const vitestTimerMethods = mockedByJest.filter(
            (method) => !jestTimerMethods.includes(method),
          );

          rawArgObject.addPropertyAssignment({
            name: "toFake",
            initializer: JSON.stringify(vitestTimerMethods, null, 2),
          });
          prop.remove();

          break;
        }
        case "timerLimit": {
          rawArgObject.addPropertyAssignment({
            name: "loopLimit",
            initializer: value,
          });

          prop.remove();

          break;
        }
        default: {
          prop.remove();
          break;
        }
      }
    }

  return "vi";
}
