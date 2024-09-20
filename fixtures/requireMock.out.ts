import { expect, test, vi } from 'vitest';

const filesystem = await vi.importMock<typeof import('fs')>('fs');

filesystem.existsSync = vi.fn().mockReturnValue(false);

test('should return false', () => {
  const result = filesystem.existsSync('');

  expect(result).toBe(true);
});
