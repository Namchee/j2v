#! /usr/bin/env node

import { readFile, rm, writeFile } from "node:fs/promises";
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
import { fileExist, getTestFiles } from "./fs";
import { transformJestScriptsToVitest } from "./scripts";
import { type CleanupFile, constructDOMCleanupFile } from "./setup";
import { transformJestTestToVitest } from "./transformer";

type PackageJSON = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
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
if (!(await fileExist(dir))) {
  Logger.error(
    "Invalid path is provided. Please ensure that the input path exists and accessible.",
  );
  process.exit(1);
}

if (!args.options.help) {
  const spinner = ora(color.cyan("Finding Jest config...\n")).start();

  Logger.init(args.options.debug);

  try {
    const isTS = await fileExist(resolve(dir, "tsconfig.json"));

    const { path, config } = await getJestConfig(dir);

    Logger.debug(
      path.length
        ? `Using Jest configuration from ${path}\n`
        : "Jest configuration not found. Using default configuration values.\n",
    );

    spinner.stopAndPersist({
      text: color.green("Configuration resolved."),
      symbol: "✓",
    });
    spinner.start(
      color.cyan("Configuring Vitest based on Jest configuration...\n"),
    );

    const vitestConfig = transformJestConfigToVitest(
      config,
      args.options.globals,
    );

    let setupFile: CleanupFile | undefined;

    spinner.stopAndPersist({
      text: color.green("Vitest configuration generated."),
      symbol: "✓",
    });
    spinner.start(color.cyan("Scanning directory for test files...\n"));

    const testFiles = await getTestFiles(vitestConfig);

    spinner.stopAndPersist({
      text: color.green(`${testFiles.length} test files found.`),
      symbol: "✓",
    });
    spinner.start(color.cyan("Resolving package.json...\n"));

    const packageJsonPath = resolve(dir, "package.json");
    let dependencies: string[] = [];
    let packageJson: PackageJSON = {};
    let scripts: string[] = [];
    let installed: string[] = [];
    let uninstalled: string[] = [];

    if (await fileExist(packageJsonPath)) {
      spinner.stopAndPersist({
        text: color.green("Package.json resolved successfully."),
        symbol: "✓",
      });
      spinner.start(color.cyan("Transforming package scripts...\n"));

      const rawPackageJSON = await readFile(packageJsonPath);

      packageJson = JSON.parse(rawPackageJSON.toString());
      dependencies = [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
      ];

      const scriptData = transformJestScriptsToVitest(
        packageJson.scripts ?? {},
      );
      scripts = scriptData.modified;
      packageJson.scripts = scriptData.commands;

      spinner.stopAndPersist({
        text: color.green("Package scripts transformed."),
        symbol: "✓",
      });
      spinner.start(color.cyan("Auditing package dependencies...\n"));

      installed = getNeededPackages(dependencies, scriptData, vitestConfig);
      uninstalled = getRemovedPackages(dependencies);

      spinner.stopAndPersist({
        text: color.green("Package dependencies audited."),
        symbol: "✓",
      });
    } else {
      spinner.stopAndPersist({
        text: color.cyan(
          "package.json not found, skipping scripts transformation and dependency cleanup.",
        ),
        symbol: "ⓘ",
      });
    }

    spinner.start(color.cyan("Constructing setup file...\n"));
    setupFile = constructDOMCleanupFile(vitestConfig, dependencies);

    if (setupFile) {
      spinner.stopAndPersist({
        text: color.green("Setup file generated."),
        symbol: "✓",
      });
    } else {
      spinner.stopAndPersist({
        text: color.cyan(
          "Test environment is not DOM, skipping setup file generation.",
        ),
        symbol: "ⓘ",
      });
    }

    const configFilename = resolve(dir, `vitest.config.${isTS ? "ts" : "js"}`);
    const setupFilename = resolve(dir, `vitest.setup.${isTS ? "ts" : "js"}`);

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

    const createdFiles = [];
    if (!(await fileExist(configFilename))) {
      createdFiles.push(`  • ${basename(configFilename)}`);
    }
    if (setupFile) {
      createdFiles.push(`  • ${basename(setupFilename)}`);
    }

    if (createdFiles.length) {
      report.push(
        args.options.dryRun
          ? `File(s) that will be created:\n${createdFiles.join("\n")}`
          : `Created file(s):\n${createdFiles.join("\n")}`,
      );
    }

    if (path) {
      report.push(
        args.options.dryRun
          ? `File(s) that will be deleted:\n  • ${basename(path)}`
          : `Deleted file(s):\n  • ${basename(path)}`,
      );
    }

    if (args.options.dryRun) {
      spinner.stopAndPersist({
        text: color.green("Dry-run completed successfully.\n"),
        symbol: "✓",
      });

      Logger.info(report.join("\n\n"));
    } else {
      spinner.start(color.cyan("Writing Vitest config (and setup files)..."));

      if (setupFile) {
        const setupText = formatSetupFile(setupFile);

        if (Array.isArray(vitestConfig?.setupFiles)) {
          vitestConfig.setupFiles.push(`./${setupFilename}`);
        }

        const setupFilepath = resolve(dir, setupFilename);

        await writeFile(setupFilepath, setupText);

        spinner.stopAndPersist({
          text: color.green(
            `Successfully written Vitest setup file on ${setupFilepath}`,
          ),
          symbol: "✓",
        });
      }

      spinner.start(color.cyan("Writing Vitest configuration file...\n"));

      if (await fileExist(configFilename)) {
        spinner.stopAndPersist({
          text: color.cyan(
            "Existing Vitest configuration already exists. Skipping configuration file generation.",
          ),
          symbol: "ⓘ",
        });
      } else {
        const configText = formatVitestConfig(vitestConfig);

        await writeFile(configFilename, configText);

        spinner.stopAndPersist({
          text: color.green(
            `Successfully written Vitest configuration file on ${basename(configFilename)}.`,
          ),
          symbol: "✓",
        });
      }

      spinner.start(
        color.cyan(`Transforming ${testFiles.length} test file(s)...\n`),
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
        report[0] += `\n${transformedTests.map((test) => `  • ${basename(test.path)} ➜ ${test.path}`).join("\n")}`;

        spinner.stopAndPersist({
          text: color.green(
            `Successfully transformed ${transformedTests.length} test file(s).`,
          ),
          symbol: "✓",
        });
      }

      if (await fileExist(packageJsonPath)) {
        spinner.start(color.cyan("Updating package scripts...\n"));

        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

        spinner.stopAndPersist({
          text: color.green("Successfully updated package.json."),
          symbol: "✓",
        });
      }

      if (installed.length || uninstalled.length) {
        spinner.stopAndPersist({
          text: color.cyan("Cleaning Dependency..."),
          symbol: "ⓘ",
        });
        spinner.indent = 2;

        const pm = await detect();

        if (installed.length) {
          spinner.start(color.cyan("Installing required dependencies...\n"));
          await install(pm, installed);
          spinner.stopAndPersist({
            text: color.green("Dependencies installed successfully."),
            symbol: "✓",
          });
        }

        if (uninstalled.length) {
          spinner.start(color.cyan("Removing unneeded dependencies...\n"));
          await uninstall(pm, uninstalled);
          spinner.stopAndPersist({
            text: color.green("Unneeded dependencies removed successfully."),
            symbol: "✓",
          });
        }

        spinner.indent = 0;
      }

      if (path) {
        spinner.start(color.green("Removing Jest configuration...\n"));

        await rm(path);

        spinner.stopAndPersist({
          text: color.green("Jest configuration removed successfully."),
          symbol: "✓",
        });
      }

      Logger.info("");
      Logger.info(report.join("\n\n"));
      Logger.info("");

      spinner.stopAndPersist({
        symbol: "✨",
        text: color.green(
          "Jest test suite converted successfully. You're good to Vitest 🚀\n",
        ),
      });
    }
  } catch (err) {
    const error = err as Error;

    spinner.fail(color.red(error.message));

    Logger.debug(`${error.name}: ${error.message} \n${error.stack}`);
  }
}
