#! /usr/bin/env node

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import cac from "cac";
import ora from "ora";
import color from "picocolors";

import { Logger } from "./logger";

import {
  getNeededPackages,
  getRemovedPackages,
  install,
  uninstall,
} from "./deps";
import { formatSetupFile, formatVitestConfig } from "./formatter";
import { getJestConfig } from "./jest";
import { transformJestConfigToVitest } from "./mapper";

import { detect } from "detect-package-manager";
import { getTestFiles } from "./fs";
import { transformJestScriptsToVitest } from "./scripts";
import { type CleanupFile, constructDOMCleanupFile } from "./setup";
import { transformJestTestToVitest } from "./transformer";

const cli = cac("j2v");
cli.help();
cli.version("0.1.0");
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

if (!args.options.help) {
  const spinner = ora(color.green("Finding Jest config...\n"));

  Logger.init(args.options.debug);

  try {
    spinner.start();

    const isTS = existsSync(resolve(process.cwd(), "tsconfig.json"));

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

    Logger.debug("Vitest configuration generated");

    spinner.text = color.green("Scanning directory for test files...\n");

    const testFiles = await getTestFiles(vitestConfig);

    Logger.debug(`${testFiles.length} test files found.`);

    const packageJsonPath = resolve(process.cwd(), "package.json");
    let scripts: string[] = [];
    let installed: string[] = [];
    let uninstalled: string[] = [];

    if (existsSync(packageJsonPath)) {
      Logger.debug("package.json found. Jest scripts will be transformed.");

      spinner.text = color.green("Transforming package's scripts...\n");

      const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
      const dependencies = [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.devDependencies),
      ];

      const scriptData = transformJestScriptsToVitest(packageJson.scripts);
      scripts = scriptData.modified;
      setupFile = constructDOMCleanupFile(vitestConfig, dependencies);

      installed = getNeededPackages(dependencies, scriptData, vitestConfig);
      uninstalled = getRemovedPackages(dependencies);
    } else {
      Logger.info(
        "package.json not found, skipping scripts transformation and dependency cleanup.",
      );
    }

    const configFilename = resolve(
      process.cwd(),
      `vitest.config.${isTS ? "ts" : "js"}`,
    );
    const setupFilename = resolve(
      process.cwd(),
      `vitest.setup.${isTS ? "ts" : "js"}`,
    );

    const report = [];

    let header = args.options.dryRun
      ? `Found ${testFiles.length} test file(s) that can be transformed${testFiles.length ? ":" : "."}`
      : `Transformed ${testFiles.length} test file(s)${testFiles.length ? ":" : "."}`;

    if (testFiles.length) {
      header += `\n${testFiles.map((test) => `  • ${basename(test.path)} ➜ ${test.path}`).join("\n")}`;
    }

    report.push(header);

    if (installed.length) {
      const list = installed.map((dep) => `  • ${dep}`).join("\n");
      report.push(
        args.options.dryRun
          ? `Dependencies that will be installed:\n${list}`
          : `Installed dependencies:\n${list}`,
      );
    }

    if (uninstalled.length) {
      const list = uninstalled.map((dep) => `  • ${dep}`).join("\n");
      report.push(
        args.options.dryRun
          ? `Dependencies that will be removed:\n${list}`
          : `Removed dependencies:\n${list}`,
      );
    }

    if (scripts.length) {
      const list = scripts.map((dep) => `  • ${dep}`).join("\n");
      report.push(
        args.options.dryRun
          ? `NPM scripts that will be transformed / introduced:\n${list}`
          : `Transformed / introduced npm scripts:\n${list}`,
      );
    }

    const createdFiles = [`  • ${basename(configFilename)}`];
    if (setupFile) {
      createdFiles.push(`  • ${basename(setupFilename)}`);
    }
    report.push(
      args.options.dryRun
        ? `File(s) that will be created:\n${createdFiles.join("\n")}`
        : `Created file(s):\n${createdFiles.join("\n")}`,
    );

    if (path) {
      report.push(
        args.options.dryRun
          ? `File(s) that will be deleted:\n  • ${basename(path)}`
          : `Deleted file(s):\n  • ${basename(path)}`,
      );
    }

    if (args.options.dryRun) {
      spinner.succeed(" Dry-run completed successfully.\n");

      Logger.info(report.join("\n\n"));
    } else {
      spinner.text = color.green(
        "Writing Vitest config (and setup files)...\n",
      );

      if (setupFile) {
        const setupText = formatSetupFile(setupFile);

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

      writeFileSync(configFilename, configText);

      Logger.debug(
        `Successfully written Vitest configuration file on ${configFilename}`,
      );

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

      spinner.text = color.green("Tidying package dependencies...");

      const pm = await detect();
      install(pm, installed);
      uninstall(pm, uninstalled);

      Logger.debug(
        "Succesfully installed required dependencies and removed unnecessary dependencies",
      );

      if (path) {
        spinner.text = "Removing unnecessary file(s)...";

        rmSync(path);

        Logger.debug("Succesfully removed unnecessary files");
      }

      Logger.info(report.join("\n\n"));

      spinner.succeed(
        color.green(
          `✨ Succesfully converted Jest test suite to Vitest. You're good to Vitest 🚀\n`,
        ),
      );
    }
  } catch (err) {
    const error = err as Error;

    spinner.fail(color.red(`Transformation failed due to ${error.message}\n`));

    Logger.error(error);
  }
}
