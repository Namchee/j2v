import { jest } from "@jest/globals";

function fn(value: number) {
  return 1 + fn(value - 1);
}

const _sumRecursively: jest.Mock<(value: number) => number> = jest.fn(
  (value) => {
    if (value === 0) {
      return 0;
    }

    return value + fn(value - 1);
  },
);
