import * as fs from 'node:fs';
import { expect, test, vi } from 'vitest';

vi.mock('node:fs');

test('example test using jest.mocked', async () => {
  const mockedFetchData = vi.mocked(fs, true);

  mockedFetchData.mockResolvedValue('mocked data');

  const result = await fs.readFile();

  expect(result).toBe('mocked data');
  expect(mockedFetchData).toHaveBeenCalledTimes(1);
});
