import { beforeEach } from 'vitest';

function setActivePinia(_pinia) {
  // dummy
}

function createTestingPinia() {
  return 1;
}

beforeEach(() => {
  setActivePinia(createTestingPinia());
});
