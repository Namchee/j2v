import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('sample test', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should do something', async () => {
    const runOrder: string[] = [];

    const mock1 = vi.fn(() => runOrder.push('mock1'));
    const mock2 = vi.fn(() => runOrder.push('mock2'));
    const mock3 = vi.fn(() => runOrder.push('mock3'));

    setTimeout(mock1, 100);
    setTimeout(mock2, 0);
    setTimeout(mock3, 50);

    await vi.advanceTimersToNextTimerAsync();

    expect(runOrder).toEqual(['mock2']);
  });
});
