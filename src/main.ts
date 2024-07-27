#! /usr/bin/env node

import cac from "cac";

const cli = cac();
cli
  .option("--global", "Enable Vitest global API to your test files", {
    default: false,
  });

cli.parse()
