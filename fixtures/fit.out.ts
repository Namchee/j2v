import { expect, it } from 'vitest';

function inchesOfRain() {
  return 0;
}

// biome-ignore lint/suspicious/noFocusedTests: we want to test this
it.only('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
