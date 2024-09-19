test('example test using jest fake timers with multiple arguments', () => {
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
});
