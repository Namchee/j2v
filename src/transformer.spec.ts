import { beforeAll, describe, expect, it } from "vitest";

import { Logger } from "./logger";
import { transformJestTestToVitest } from "./transformer";

describe("transformJestTestToVitest", () => {
  beforeAll(() => {
    Logger.init(false);
  });

  it("should transform generic tests", () => {
    const path = "some/random/path.ts";
    const code = `describe('sample test', () => {
  it('return 2', () => {
    const result = 1 + 1;

    expect(result).toBe(2);
  });
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain(`import { describe, it, expect } from "vitest";`);
  })

  it("should transform advanceTimersToNextTimer to Vitest", () => {
    const path = "some/random/path.ts";
    const code = `describe('sample test', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should do something', () => {
    const runOrder: Array<string> = [];

    const mock1 = jest.fn(() => runOrder.push('mock1'));
    const mock2 = jest.fn(() => runOrder.push('mock2'));
    const mock3 = jest.fn(() => runOrder.push('mock3'));

    setTimeout(mock1, 100);
    setTimeout(mock2, 0);
    setTimeout(mock3, 50);

    jest.advanceTimersToNextTimer();

    expect(runOrder).toEqual(['mock2']);
  });
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.advanceTimersToNextTimer();');
  });

  it("should transform timer argument into multiple advanceTimersToNextTimer calls", () => {
    const path = "some/random/path.ts";
    const code = `describe('sample test', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should do something', () => {
    const runOrder: Array<string> = [];

    const mock1 = jest.fn(() => runOrder.push('mock1'));
    const mock2 = jest.fn(() => runOrder.push('mock2'));
    const mock3 = jest.fn(() => runOrder.push('mock3'));

    setTimeout(mock1, 100);
    setTimeout(mock2, 0);
    setTimeout(mock3, 50);

    jest.advanceTimersToNextTimer(2);

    expect(runOrder).toEqual(['mock2', 'mock3', 'mock1']);
  });
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.advanceTimersToNextTimer().advanceTimersToNextTimer();');
  });
});
