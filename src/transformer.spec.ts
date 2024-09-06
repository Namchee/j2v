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

    expect(transformed[0]?.content).toContain(`import { describe, it, expect } from 'vitest';`);
  });

  it("should not wrap jest.mock factory with default if the return type is an object", () => {
    const path = "some/random/path.ts";
    const code = `import api from './api';

jest.mock('./api', () => ({
  fetchData: jest.fn().mockResolvedValue('mocked data'),
}));`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).not.toContain('default: {');
  });

  it("should wrap jest.mock factory with default if the return type is a primitive", () => {
    const path = "some/random/path.ts";
    const code = `import api from './api';

jest.mock('./api', () => 5);`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('default: 5');
  });

  it("should wrap jest.mock factory with default if the return type is a function", () => {
    const path = "some/random/path.ts";
    const code = `import api from './api';

jest.mock('./api', () => function() { return 5; });`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('default: function() { return 5; }');
  });

  it("should transform useFakeTimers with arguments correctly", () => {
    const path = "some/random/path.ts";
    const code = `test('example test using jest fake timers with multiple arguments', () => {
  jest.useFakeTimers({
    now: new Date('2024-01-01T00:00:00Z'),
    advanceTimers: 5_000,
    doNotFake: [],
    timerLimit: 50,
  });

  let count = 0;

  const intervalId = setInterval(() => {
    count += 1;
  }, 1000);

  jest.advanceTimersByTime(5000);

  expect(count).toBe(5);

  expect(Date.now()).toBe(new Date('2024-01-01T00:00:05Z').getTime());

  clearInterval(intervalId);
  jest.useRealTimers();
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.useFakeTimers');
    expect(transformed[0]?.content).toContain('shouldAdvanceTime: true');
    expect(transformed[0]?.content).toContain('advanceTimeDelta: 5_000');
    expect(transformed[0]?.content).toContain('loopLimit: 50');
    expect(transformed[0]?.content).toContain('toFake');
  });

  it("should transform jest.mocked without arguments correctly", () => {
    const path = "some/random/path.ts";
    const code = `import { fetchData } from './api';

jest.mock('./api');

test('example test using jest.mocked', async () => {
  const mockedFetchData = jest.mocked(fetchData);

  mockedFetchData.mockResolvedValue('mocked data');

  const result = await fetchData();

  expect(result).toBe('mocked data');
  expect(mockedFetchData).toHaveBeenCalledTimes(1);
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.mocked(fetchData);');
  });

  it("should transform jest.mocked with arguments correctly", () => {
    const path = "some/random/path.ts";
    const code = `import { fetchData } from './api';

jest.mock('./api');

test('example test using jest.mocked', async () => {
  const mockedFetchData = jest.mocked(fetchData, { shallow: false });

  mockedFetchData.mockResolvedValue('mocked data');

  const result = await fetchData();

  expect(result).toBe('mocked data');
  expect(mockedFetchData).toHaveBeenCalledTimes(1);
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('vi.mocked(fetchData, true);');
  });

  it("should transform requireActual correctly", () => {
    const path = "some/random/path.ts";
    const code = `jest.mock('../myModule', () => {
  const originalModule =
    jest.requireActual<typeof import('../myModule')>('../myModule');

  return {
    __esModule: true,
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

  it("should transform jest.Mock type", () => {
    const path = "some/random/path.ts";
    const code = `import {jest} from '@jest/globals';

const sumRecursively: jest.Mock<(value: number) => number> = jest.fn(value => {
  if (value === 0) {
    return 0;
  } else {
    return value + fn(value - 1);
  }
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).not.toContain('@jest/globals');
    expect(transformed[0]?.content).toContain('import { type Mock } from \'vitest\';');
  });

  it("should replace JEST_WORKER_ID with VITEST_POOL_ID", () => {
    const path = "some/random/path.ts";
    const code = `it("should log the JEST_WORKER_ID", () => {
  const workerId = process.env.JEST_WORKER_ID;

  if (workerId === "1") {
    expect(true).toBe(true); // Example assertion for worker 1
  } else {
    expect(true).toBe(false); // Example assertion for any other worker
  }
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain('process.env.VITEST_POOL_ID');
  });

  it("should replace literal JEST_WORKER_ID with VITEST_POOL_ID", () => {
    const path = "some/random/path.ts";
    const code = `it("should log the JEST_WORKER_ID", () => {
  const workerId = process.env['JEST_WORKER_ID'];

  if (workerId === "1") {
    expect(true).toBe(true); // Example assertion for worker 1
  } else {
    expect(true).toBe(false); // Example assertion for any other worker
  }
});`;

    const transformed = transformJestTestToVitest([{
      path,
      content: code,
    }]);

    expect(transformed[0]?.content).toContain("process.env['VITEST_POOL_ID']");
  });
 });
