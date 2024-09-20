import * as fs from 'node:fs';

jest.mock('node:fs');

test('example test using jest.mocked', async () => {
  const mockedFetchData = jest.mocked(fs, { shallow: false });

  mockedFetchData.mockResolvedValue('mocked data');

  const result = await fs.readFile();

  expect(result).toBe('mocked data');
  expect(mockedFetchData).toHaveBeenCalledTimes(1);
});
