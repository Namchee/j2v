import { readFile as readFileCb } from "node:fs";
import { promisify } from "node:util";

import { beforeAll, describe, expect, it } from "vitest";

import { globSync } from "tinyglobby";

import { Logger } from "./logger";
import { transformJestTestToVitest } from "./transformer";

const readFile = promisify(readFileCb);

describe("transformJestToVitest", () => {
  const givenInput = globSync(["fixtures/**/*.in.ts"], {
    ignore: ["fixtures/globals.in.ts"],
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

  it("should not import anything if 'globals' is enabled", async () => {
    const inputContent = await Promise.all([
      readFile(`${process.cwd()}/fixtures/globals.in.ts`),
      readFile(`${process.cwd()}/fixtures/globals.out.ts`),
    ]);

    const transformed = transformJestTestToVitest(
      [
        {
          path: "fixtures/globals.in.ts",
          content: inputContent[0].toString(),
        },
      ],
      {
        globals: true
      },
    );

    expect(transformed[0]?.content).toBe(inputContent[1].toString());
  });

  it("should transform multiple files at the same time", async () => {
    const inputContent = await Promise.all([
      readFile(`${process.cwd()}/fixtures/afterAll.in.ts`),
      readFile(`${process.cwd()}/fixtures/afterAll.out.ts`),
      readFile(`${process.cwd()}/fixtures/beforeAll.in.ts`),
      readFile(`${process.cwd()}/fixtures/beforeAll.out.ts`),
    ]);

    const transformed = transformJestTestToVitest(
      [
        {
          path: "fixtures/afterAll.in.ts",
          content: inputContent[0].toString(),
        },
        {
          path: "fixtures/beforeAll.in.ts",
          content: inputContent[2].toString(),
        },
      ],
      {
      },
    );

    expect(transformed[0]?.content).toBe(inputContent[1].toString());
    expect(transformed[1]?.content).toBe(inputContent[3].toString());
  });
});
