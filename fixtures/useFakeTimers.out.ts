import { expect, test, vi } from 'vitest';

test('example test using jest fake timers with multiple arguments', () => {
  vi.useFakeTimers({
    now: new Date('2024-01-01T00:00:00Z'),
    shouldAdvanceTime: true,
    advanceTimeDelta: 5_000,
    toFake: [
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
      "clearTimeout"
    ],
    loopLimit: 50,
  });

  let count = 0;

  const intervalId = setInterval(() => {
    count += 1;
  }, 1000);

  vi.advanceTimersByTime(5000);

  expect(count).toBe(5);

  expect(Date.now()).toBe(new Date('2024-01-01T00:00:05Z').getTime());

  clearInterval(intervalId);
  vi.useRealTimers();
});
