function inchesOfRain() {
  return 0;
}

fit.failing('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0);
});
