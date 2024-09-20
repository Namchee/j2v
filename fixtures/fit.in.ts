function inchesOfRain() {
  return 0;
}

// biome-ignore lint/suspicious/noFocusedTests: we want to test this
fit('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
