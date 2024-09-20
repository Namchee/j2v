import * as fs from 'node:fs';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(fs, 'existsSync').mockReturnValue(false);
});
