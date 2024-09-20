import { describe } from 'vitest';

// biome-ignore lint/suspicious/noFocusedTests: we are going to test this
describe.only('something', () => {
  console.log('test executed');
});
