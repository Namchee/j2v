import { expect, it } from 'vitest';

function inchesOfRain() {
  return 0;
}

it.skip('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
