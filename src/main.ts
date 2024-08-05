#! /usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import cac from "cac";
import ora from "ora";
import color from "picocolors";

import { detect } from "detect-package-manager";

import { Logger } from "./logger";

import { installVitest, removeJestDeps } from "./deps";
import { formatSetupFile, formatVitestConfig } from "./formatter";
import { getJestConfig } from "./jest";
import { transformJestConfigToVitest } from "./mapper";
import { transformJestScriptsToVitest } from "./scripts";
import { type CleanupFile, constructDOMCleanupFile } from "./setup";

const cli = cac();
cli
  .option("--globals", "Enable Vitest global API to your test files", {
    default: false,
  })
  .option("-d, --debug", "Show debugging output", {
    default: false,
  });

const args = cli.parse();
// force new line
const spinner = ora().start(color.green("Finding Jest config...\n"));

Logger.init(args.options.debug);

try {
  const { path, config } = await getJestConfig();

  Logger.debug(
    path.length
      ? `Using Jest configuration from ${path}`
      : "Jest configuration not found. Using default settings.",
  );

  spinner.text = color.green(
    "Configuring Vitest based on Jest configuration...",
  );

  const vitestConfig = transformJestConfigToVitest(config);
  let setupFile: CleanupFile | undefined;
  let isTS = true;

  Logger.debug("Vitest configuration generated");

  spinner.text = color.green("Transforming test files...");

  // TODO: write transformer script here...

  spinner.text = color.green("Transforming package's scripts...");
  const packageJsonPath = resolve(process.cwd(), "package.json");

  if (existsSync(packageJsonPath)) {
    Logger.debug("package.json found. Jest scripts will be transformed.");

    const packageManager = await detect();
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    const dependencies = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)];

    if (!dependencies.includes("typescript")) {
      isTS = false;
    }

    const newScripts = transformJestScriptsToVitest(packageJson.scripts);
    packageJson.scripts = newScripts;

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    Logger.debug("package.json scripts rewritten");

    setupFile = constructDOMCleanupFile(vitestConfig, dependencies);

    spinner.text = color.green("Performing dependency cleanup...");

    installVitest(packageManager, dependencies);

    Logger.debug("Vitest successfully installed");

    const uninstalled = removeJestDeps(packageManager, dependencies);

    Logger.debug(`Successfully uninstalled ${uninstalled.join(', ')}`);
  } else {
    Logger.info("package.json not found, skipping scripts transformation and dependency cleanup.");
  }

  spinner.text = "Writing Vitest config (and setup files)...";

  if (setupFile) {
    const setupText = formatSetupFile(setupFile);
    const setupFilename = `vitest.setup.${isTS ? 'ts' : 'js'}`;

    if (Array.isArray(vitestConfig?.setupFiles)) {
      vitestConfig.setupFiles.push(`./${setupFilename}`);
    }

    const setupFilepath = resolve(process.cwd(), setupFilename);

    writeFileSync(setupFilepath, setupText);

    Logger.debug(`Successfully written Vitest setup file on ${setupFilepath}`);
  } else {
    Logger.debug("Setup file is not necessary as target environment is not DOM.");
  }

  const configText = formatVitestConfig(vitestConfig);
  const configFilename = resolve(process.cwd(), `vitest.config.${isTS ? 'ts' : 'js'}`);

  writeFileSync(configFilename, configText);

  Logger.debug(`Successfully written Vitest configuration file on ${configFilename}`);

  spinner.succeed(color.green(`✨ Succesfully converted Jest test suite to Vitest. You're good to Vitest 🚀`));
} catch (err) {
  spinner.stop();

  const error = err as Error;

  Logger.error(error);
}
