import { readFile as readFileCb } from "node:fs";
import { promisify } from "node:util";

import { beforeAll, describe, expect, it } from "vitest";

import { globSync } from "tinyglobby";

import { Logger } from "./logger";
import { transformJestTestToVitest } from "./transformer";

const readFile = promisify(readFileCb);

describe("transformJestToVitest", () => {
  const givenInput = globSync(["fixtures/**/*.in.ts"], {
    ignore: ["fixtures/global.(in|out).(j|t)sx?"],
  });

  beforeAll(() => {
    Logger.init(false);
  });

  for (const input of givenInput) {
    const output = input.replace(/in\.ts$/, "out.ts");

    it(`should transform ${input} to ${output}`, async () => {
      const inputContent = await Promise.all([
        readFile(input),
        readFile(output),
      ]);

      const transformed = transformJestTestToVitest(
        [
          {
            path: input,
            content: inputContent[0].toString(),
          },
        ],
        {},
      );

      expect(transformed[0]?.content).toBe(inputContent[1].toString());
    });
  }
});
