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

type PackageJSON = {
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const cli = cac("j2v");
cli.help();
cli.version("0.1.0");
cli
  .command("[dirname]", "Working directory of the project")
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

const dir = args.args[0] ?? process.cwd();
if (!existsSync(dir)) {
  Logger.error("Invalid path is provided. Please ensure that the input path exists and accessible.");
  process.exit(1);
}

if (!args.options.help) {
  const spinner = ora(color.green("Finding Jest config...\n"),);

  Logger.init(args.options.debug);

  try {
    spinner.start();

    const isTS = existsSync(resolve(dir, "tsconfig.json"));

    const { path, config } = await getJestConfig(dir);

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

    const packageJsonPath = resolve(dir, "package.json");
    let packageJson: PackageJSON;
    let scripts: string[] = [];
    let installed: string[] = [];
    let uninstalled: string[] = [];

    if (existsSync(packageJsonPath)) {
      Logger.debug("package.json found. Jest scripts will be transformed.");

      spinner.text = color.green("Transforming package's scripts...\n");

      packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
      const dependencies = [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
      ];

      const scriptData = transformJestScriptsToVitest(packageJson.scripts);
      scripts = scriptData.modified;
      packageJson.scripts = scriptData.commands;

      setupFile = constructDOMCleanupFile(vitestConfig, dependencies);

      installed = getNeededPackages(dependencies, scriptData, vitestConfig);
      uninstalled = getRemovedPackages(dependencies);
    } else {
      Logger.info(
        "package.json not found, skipping scripts transformation and dependency cleanup.",
      );
    }

    const configFilename = resolve(
      dir,
      `vitest.config.${isTS ? "ts" : "js"}`,
    );
    const setupFilename = resolve(
      dir,
      `vitest.setup.${isTS ? "ts" : "js"}`,
    );

    const report = [];

    if (testFiles.length) {
      let header = `Found ${testFiles.length} test file(s) that can be transformed${testFiles.length ? ":" : "."}`;

      if (testFiles.length) {
        header += `\n${testFiles.map((test) => `  • ${basename(test.path)} ➜ ${test.path}`).join("\n")}`;
      }

      report.push(header);
    }

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
      spinner.succeed(color.green("Dry-run completed successfully.\n"));

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

        const setupFilepath = resolve(dir, setupFilename);

        writeFileSync(setupFilepath, setupText);

        Logger.debug(
          `Successfully written Vitest setup file on ${setupFilepath}`,
        );
      } else {
        Logger.debug(
          "Setup file is not necessary as target environment is not DOM.",
        );
      }

      if (existsSync(configFilename)) {
        Logger.debug("Existing Vitest configuration already exist. Skipping...")
      } else {
        const configText = formatVitestConfig(vitestConfig);

        writeFileSync(configFilename, configText);
      }

      Logger.debug(
        `Successfully written Vitest configuration file on ${basename(configFilename)}`,
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

      report[0] = `Transformed ${transformedTests.length} test file(s)${transformedTests.length ? ":" : "."}`;
      if (transformedTests.length) {
        report[0] += `\n${transformedTests.map(test => `  • ${basename(test.path)} ➜ ${test.path}`).join("\n")}`;
        Logger.debug(`Succesfully transformed ${transformedTests.length} test file(s)`);
      }

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

      spinner.text = color.green("Update package.json scripts...");

      if (existsSync(packageJsonPath)) {
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        Logger.debug("Successfully updated package.json");
      }

      Logger.info("");
      Logger.info(report.join("\n\n"));
      Logger.info("\n");

      spinner.stopAndPersist({ symbol: "✨", text: color.green("Succesfully converted Jest test suite to Vitest. You're good to Vitest 🚀\n") });
    }
  } catch (err) {
    const error = err as Error;

    spinner.fail(color.red(error.message));

    console.error(error);
  }
}
