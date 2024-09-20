import { expect, test } from 'vitest';

test('example test that may take longer', async () => {
  const result = await new Promise((resolve) => setTimeout(() => resolve('done'), 9000));

  expect(result).toBe('done');
});
