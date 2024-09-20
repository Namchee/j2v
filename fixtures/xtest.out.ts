import { expect, test } from 'vitest';

function inchesOfRain() {
  return 0;
}

test.skip('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
