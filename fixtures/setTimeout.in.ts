test('example test that may take longer', async () => {
  jest.setTimeout(5_000);

  const result = await new Promise((resolve) => setTimeout(() => resolve('done'), 9000));

  expect(result).toBe('done');
});
