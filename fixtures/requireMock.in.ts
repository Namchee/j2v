const filesystem = jest.requireMock<typeof import('fs')>('fs');

filesystem.existsSync = jest.fn().mockReturnValue(false);

test('should return false', () => {
  const result = filesystem.existsSync('');

  expect(result).toBe(true);
});
