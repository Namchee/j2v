import { beforeAll } from 'vitest';

function setActivePinia(_pinia) {
  // dummy
}

function createTestingPinia() {
  return 1;
}

beforeAll(() => {
  setActivePinia(createTestingPinia());
});
