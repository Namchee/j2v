import { afterEach } from 'vitest';

function setActivePinia(_pinia) {
  // dummy
}

function createTestingPinia() {
  return 1;
}

afterEach(() => {
  setActivePinia(createTestingPinia());
});
