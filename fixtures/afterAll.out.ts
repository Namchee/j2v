import { afterAll } from 'vitest';

function setActivePinia(_pinia) {
  // dummy
}

function createTestingPinia() {
  return 1;
}

afterAll(() => {
  setActivePinia(createTestingPinia());
});
