import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    forceRerunTriggers: ["fixtures/**/*.*"],
    coverage: {
      enabled: true,
      include: ["src/**/*.ts"],
    },
  },
});
