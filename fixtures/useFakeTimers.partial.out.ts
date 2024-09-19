import { test, vi, expect } from 'vitest';

test('example test using jest fake timers with multiple arguments', () => {
  vi.useFakeTimers({
    now: new Date('2024-01-01T00:00:00Z'),
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
