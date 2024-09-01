# j2v

Jest to Vitest CLI migration tool

## Roadmap

- [x] Jest Config Migration
  - [x] Configuration Converter
- [x] Jest Setup file migration and auto setup for JSDOM
  - [x] React
  - [x] Vue
  - [x] Svelte
  - [x] Angular
- [x] Script Migration
  - [x] Create new script
  - [x] Mod the existing one
- [x] Dependency Migration
- [x] CLI
- [x] Test file converter

## Compatibility

Not all of Jest APIs and quirks will be replaced by this utility, as some of them don't have any equivalent property in Vitest.

For the list of all compatible APIs, please see the [compatibility list](./COMPATIBILITY.md)

## Caveats

1. Indentation *may* be incorrect.

## Acknowledgments

1. This project would not exist without the existence of this [Jest migration to Vitest gist](https://gist.github.com/wojtekmaj/6defa1f358daae28bd52b7b6dbeb7ab6)
2. [vitest-codemod](https://github.com/trivikr/vitest-codemod)

## License

This project is licensed under the [MIT License](./LICENSE)
