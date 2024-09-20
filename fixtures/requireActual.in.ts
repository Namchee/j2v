jest.mock('fs', () => {
  const originalModule =
    jest.requireActual<typeof import('fs')>('fs');

  return {
    ...originalModule,
    existsSync: jest.fn(() => true),
  };
});
