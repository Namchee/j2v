# j2v

All-in-one Jest to Vitest migration tool.

## Features

- JavaScript / TypeScript compatible
- Automatically generates Vitest configuration that mimics your Jest configuration as close as possible
- Setup file generation for automated code cleanups
- Automatic Jest dependency cleanup

## Usage

```bash
## If you prefer using it without explicit installation:
# Using npm
npx @namchee/j2v

# Using pnpm
pnpx @namchee/j2v

# Using bun
bunx @namchee/j2v

## Or... install the package
# Using npm
npm install -D @namchee/j2v

# Using yarn
yarn add -D @namchee/j2v

# Using pnpm
pnpm install -D @namchee/j2v

# Using bun
bun add -D @namchee/j2v
```

## Commands

```bash
j2v/0.1.0

Usage:
  $ j2v <command> [options]

Options:
  -h, --help     Display this message
  -v, --version  Display version number
  --globals      Enable Vitest global API to your test files (default: false)
  -d, --debug    Show debugging output (default: false)
  --dry-run      Perform a dry-run of the CLI (default: false)
```

## Compatibility

Not all of Jest APIs and quirks will be replaced by this utility, as some of them don't have any equivalent property in Vitest.

For the list of all compatible APIs, please see the [compatibility list](./COMPATIBILITY.md)

## Notes

1. Jest configuration will be evaluated during conversion. Expect some derivative values (from variables, functions, etc) to be transformed into raw values.
2. Code style for transformed such as dangling commas, brace spacing on destructured objects, and semicolons might not follow the original style of the code.
3. Setup file written in CommonJS will break the test

## Acknowledgments

1. This project would not exist without the existence of this [Jest migration to Vitest gist](https://gist.github.com/wojtekmaj/6defa1f358daae28bd52b7b6dbeb7ab6)
2. [vitest-codemod](https://github.com/trivikr/vitest-codemod) as further inspiration on how should the CLI behave

## License

This project is licensed under the [MIT License](./LICENSE)
