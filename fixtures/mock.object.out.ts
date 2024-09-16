import { vi } from 'vitest';

// The script shouldn't wrap the mock with default if the return type is an object

vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue('mocked data'),
}));
