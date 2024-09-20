import { promises as fs } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { type Mocked } from 'vitest';

vi.mock('fs');

describe('mock fs.promises.readFile using jest.Mocked', () => {
  it('should mock fs.promises as a jest.Mocked object', async () => {
    async function readFileContent(filePath: string): Promise<string> {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    }

    const mockedFs = fs as Mocked<typeof fs>;

    mockedFs.readFile.mockResolvedValueOnce('mocked file content');

    const result = await readFileContent('path/to/file.txt');

    expect(result).toBe('mocked file content');

    expect(mockedFs.readFile).toHaveBeenCalledWith('path/to/file.txt', 'utf8');
  });
});