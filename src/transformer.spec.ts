import { beforeAll, describe, expect, it, } from "vitest";

import { Logger } from "./logger";
import { transformJestTestToVitest } from "./transformer";

describe("transformJestTestToVitest", () => {
  beforeAll(() => {
    Logger.init(false);
  });

  it("should transform generic test", () => {
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
  });

  it("should transform useFakeTimers with arguments correctly", () => {
    const path = "some/random/path.ts";
  });

  it("should transform requireActual correctly", () => {
    const path = "some/random/path.ts";
    const code = `jest.mock('../myModule', () => {
  // Require the original module to not be mocked...
  const originalModule =
    jest.requireActual<typeof import('../myModule')>('../myModule');

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getRandom: jest.fn(() => 10),
  };
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain(`vi.mock('../myModule', async () => {`);
    expect(transformed[0]?.content).toContain('await vi.importActual');
  });

  it("should transform requireMock correctly", () => {
    const path = "some/random/path.ts";
    const code = `test('sample test', () => {
  const mathMock = jest.requireMock('./math');

  mathMock.add = jest.fn().mockReturnValue(10);

  expect(mathMock.add(3, 5)).toBe(10);
  expect(mathMock.add).toHaveBeenCalledWith(3, 5);
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain(`test('sample test', async () => {`);
    expect(transformed[0]?.content).toContain('const mathMock = await vi.importMock(');
  });

  it("should transform setTimeout correctly", () => {
    const path = "some/random/path.ts";
    const code = `jest.setTimeout(10000);

test('example test that may take longer', async () => {
  const result = await new Promise((resolve) => setTimeout(() => resolve('done'), 9000));

  expect(result).toBe('done');
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.setConfig({ testTimeout: 10000 });');
  });

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

    expect(transformed[0]?.content).toContain('vi.useFakeTimers();');
    expect(transformed[0]?.content).toContain('vi.useRealTimers();');
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

    expect(transformed[0]?.content).toContain('vi.useFakeTimers();');
    expect(transformed[0]?.content).toContain('vi.useRealTimers();');
    expect(transformed[0]?.content).toContain('vi.advanceTimersToNextTimer().advanceTimersToNextTimer();');
  });
});
