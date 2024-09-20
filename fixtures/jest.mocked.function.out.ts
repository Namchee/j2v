import { promises as fs } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { type MockedFunction } from 'vitest';

vi.mock('fs');

describe('mock fs.promises.readFile', () => {
  it('should mock fs.readFile to return mocked content', async () => {
    async function readFileContent(filePath: string): Promise<string> {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    }

    const mockedReadFile = fs.readFile as MockedFunction<typeof fs.readFile>;

    mockedReadFile.mockResolvedValueOnce('mocked file content');

    const result = await readFileContent('path/to/file.txt');

    expect(result).toBe('mocked file content');
    expect(mockedReadFile).toHaveBeenCalledWith('path/to/file.txt', 'utf8');
  });
});