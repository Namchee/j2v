import afterAll from "./globals/afterAll";
import afterEach from "./globals/afterEach";
import beforeAll from "./globals/beforeAll";
import beforeEach from "./globals/beforeEach";
import describe from "./globals/describe";
import expect from "./globals/expect";
import fdescribe from "./globals/fdescribe";
import fit from "./globals/fit";
import it from "./globals/it";
import test from "./globals/test";
import xdescribe from "./globals/xdescribe";
import xit from "./globals/xit";
import xtest from "./globals/xtest";

import type { CallExpressionReplacer } from "../transformer";

export const JEST_GLOBALS: Record<string, CallExpressionReplacer> = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  fdescribe,
  fit,
  it,
  test,
  xdescribe,
  xit,
  xtest,
};
