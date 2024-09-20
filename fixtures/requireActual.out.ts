import { vi } from 'vitest';

vi.mock('fs', async () => {
  const originalModule =
    await vi.importActual<typeof import('fs')>('fs');

  return {
    ...originalModule,
    existsSync: vi.fn(() => true),
  };
});
