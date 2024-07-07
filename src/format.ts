import { inspect } from "node:util";

const configString = inspect(cleanedConfig, { compact: false })
    .split("\n")
    .map((value, idx) => {
      return idx > 0 ? `  ${value}` : value;
    })
    .join("\n");

  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: ${configString}
});
`;
