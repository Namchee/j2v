#! /usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import cac from "cac";
import { detect } from "detect-package-manager";
import ora from "ora";
import color from "picocolors";

import { Logger } from "./logger";

import { installVitest, removeJestDeps } from "./deps";
import { formatSetupFile, formatVitestConfig } from "./formatter";
import { getJestConfig } from "./jest";
import { transformJestConfigToVitest } from "./mapper";

import { getTestFiles } from "./fs";
import { transformJestScriptsToVitest } from "./scripts";
import { type CleanupFile, constructDOMCleanupFile } from "./setup";
import { transformJestTestToVitest } from "./transformer";

const cli = cac();
cli
  .option("--globals", "Enable Vitest global API to your test files", {
    default: false,
  })
  .option("-d, --debug", "Show debugging output", {
    default: false,
  })
  .option("--dry-run", "Perform a dry-run of the CLI", {
    default: false,
  });

const args = cli.parse();
const spinner = ora(color.green("Finding Jest config...\n"));

Logger.init(args.options.debug);

try {
  spinner.start();

  const { path, config } = await getJestConfig();

  Logger.debug(
    path.length
      ? `Using Jest configuration from ${path}`
      : "Jest configuration not found. Using default configuration values.",
  );

  spinner.text = color.green(
    "Configuring Vitest based on Jest configuration...\n",
  );

  const vitestConfig = transformJestConfigToVitest(
    config,
    args.options.globals,
  );

  let setupFile: CleanupFile | undefined;
  const isTS = existsSync(resolve(process.cwd(), "tsconfig.json"));

  Logger.debug("Vitest configuration generated");

  spinner.text = color.green("Scanning directory for test files...\n");

  const testFiles = await getTestFiles(vitestConfig);

  if (args.options.dryRun) {
    Logger.info(`${testFiles.length} test files found.`);
  } else {
    spinner.text = color.green(
      `Transforming ${testFiles.length} test file(s)...\n`,
    );

    const transformedTests = transformJestTestToVitest(
      testFiles,
      args.options.globals,
    );

    await Promise.all(
      transformedTests.map((test) => writeFile(test.path, test.content)),
    );

    Logger.debug(`Succesfully transformed ${testFiles.length} test file(s)`);
  }

  const packageJsonPath = resolve(process.cwd(), "package.json");

  if (existsSync(packageJsonPath) && !args.options.dryRun) {
    Logger.debug("package.json found. Jest scripts will be transformed.");

    spinner.text = color.green("Transforming package's scripts...\n");

    const packageManager = await detect();
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    const dependencies = [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.devDependencies),
    ];

    const newScripts = transformJestScriptsToVitest(packageJson.scripts);
    packageJson.scripts = newScripts;

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    Logger.debug("package.json scripts rewritten");

    setupFile = constructDOMCleanupFile(vitestConfig, dependencies);

    spinner.text = color.green("Performing dependency cleanup...\n");

    installVitest(packageManager, dependencies);

    Logger.debug("Vitest successfully installed");

    const uninstalled = removeJestDeps(packageManager, dependencies);

    if (uninstalled.length) {
      Logger.debug(`Successfully uninstalled ${uninstalled.join(", ")}`);
    }
  } else {
    Logger.info(
      "package.json not found, skipping scripts transformation and dependency cleanup.",
    );
  }

  if (args.options.dryRun) {
    spinner.text = "✨ Dry-run completed successfully.\n";
  } else {
    spinner.text = color.green("Writing Vitest config (and setup files)...\n");

    if (setupFile) {
      const setupText = formatSetupFile(setupFile);
      const setupFilename = `vitest.setup.${isTS ? "ts" : "js"}`;

      if (Array.isArray(vitestConfig?.setupFiles)) {
        vitestConfig.setupFiles.push(`./${setupFilename}`);
      }

      const setupFilepath = resolve(process.cwd(), setupFilename);

      writeFileSync(setupFilepath, setupText);

      Logger.debug(
        `Successfully written Vitest setup file on ${setupFilepath}`,
      );
    } else {
      Logger.debug(
        "Setup file is not necessary as target environment is not DOM.",
      );
    }

    const configText = formatVitestConfig(vitestConfig);
    const configFilename = resolve(
      process.cwd(),
      `vitest.config.${isTS ? "ts" : "js"}`,
    );

    writeFileSync(configFilename, configText);

    Logger.debug(
      `Successfully written Vitest configuration file on ${configFilename}`,
    );

    spinner.succeed(
      color.green(
        `✨ Succesfully converted Jest test suite to Vitest. You're good to Vitest 🚀\n`,
      ),
    );
  }
} catch (err) {
  const error = err as Error;

  spinner.fail(color.red(`❌ Transformation failed due to ${error.message}\n`));

  Logger.error(error);
}
