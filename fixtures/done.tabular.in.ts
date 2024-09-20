test.failing.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 1, expected: 3 },
])('.add($a, $b)', ({ a, b, expected }, done) => {
  setTimeout(() => {
    expect(a + b).toBe(expected);
    done();
  }, 100);
});
