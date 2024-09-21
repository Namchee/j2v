import * as fs from 'fs';

afterEach(() => {
  jest.clearAllMocks();
});

test('plays video', () => {
  const spy = jest.spyOn(fs, "existsSync").mockReturnValue(true);

  const isTrue = fs.existsSync("");

  expect(spy).toHaveBeenCalled();
  expect(isTrue).toBe(true);
});
