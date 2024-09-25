import * as fs from 'fs';
import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.clearAllTimers();
});

test('plays video', () => {
  const spy = vi.spyOn(fs, "existsSync").mockReturnValue(true);

  const isTrue = fs.existsSync("");

  expect(spy).toHaveBeenCalled();
  expect(isTrue).toBe(true);
});
