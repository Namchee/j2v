import { vi } from "vitest";
import { type Mock } from "vitest";

function fn(value: number) {
  return 1 + fn(value - 1);
}

const _sumRecursively: Mock<(value: number) => number> = vi.fn(
  (value) => {
    if (value === 0) {
      return 0;
    }

    return value + fn(value - 1);
  },
);
