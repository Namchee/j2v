import { expect, test } from 'vitest';

test.fails.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 1, expected: 3 },
])('.add($a, $b)', ({ a, b, expected }) => new Promise((done) => {
  setTimeout(() => {
    expect(a + b).toBe(expected);
    done();
  }, 100);
}));
