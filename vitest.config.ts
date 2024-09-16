import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    forceRerunTriggers: ["fixtures/**/*.(js|ts)"]
  }
});
