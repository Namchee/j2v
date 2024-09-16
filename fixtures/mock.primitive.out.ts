import { vi } from 'vitest';

vi.mock('./api', () => ({
  default: 5
}));
