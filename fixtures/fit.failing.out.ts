import { expect, it } from 'vitest';

function inchesOfRain() {
  return 0;
}

it.only.fails('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
