# j2v

## Proses

-> cari config
-> convert confignya
-> bikin setup file
-> convert test file
-> tulis hasil confignya
-> manage depsnya

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
- [ ] Test file converter

## Support

### Configuration and CLI

| Key | Supported? | Transformed To |
| --- | ---------- | -------------- |
| `automock` | ❌ | - |
| [`bail`](https://jestjs.io/docs/configuration#bail-number--boolean) | ✅ | [`bail`](https://vitest.dev/config/#bail)[^1] |
| [`cacheDirectory`](https://jestjs.io/docs/configuration#cachedirectory-string) | ✅ | [`server.deps.cacheDir`](https://vitest.dev/config/#server-deps-cachedir) |
| [`clearMocks`](https://jestjs.io/docs/configuration#clearmocks-boolean) | ✅ | [`clearMocks`](https://vitest.dev/config/#clearmocks) |
| [`collectCoverage`](https://jestjs.io/docs/configuration#collectcoverage-boolean) | ✅ | [`coverage.enabled`](https://vitest.dev/config/#coverage-enabled) |
| [`collectCoverageFrom`](https://jestjs.io/docs/configuration#collectcoveragefrom-array) | ✅ | [`coverage.include`](https://vitest.dev/config/#coverage-include) |
| [`coverageDirectory`](https://jestjs.io/docs/configuration#coveragedirectory-string) | ✅ | [`coverage.reportsDirectory`](https://vitest.dev/config/#coverage-reportsdirectory) |
| [`coveragePathIgnorePatterns`](https://jestjs.io/docs/configuration#coveragepathignorepatterns-arraystring) | ✅ | [`coverage.exclude`](https://vitest.dev/config/#coverage-exclude) |
| [`coverageProvider`](https://jestjs.io/docs/configuration#coverageprovider-string) | ✅ | [`coverage.provider`](https://vitest.dev/config/#coverage-provider)[^2] |
| [`coverageReporters`](https://vitest.dev/config/#coverage-provider) | ✅ | [`coverageReporter`](https://vitest.dev/config/#coverage-reporter) |
| [`coverageThreshold`](https://jestjs.io/docs/configuration#coveragethreshold-object) | ✅ | [`coverage.threshold`](https://vitest.dev/config/#coverage-thresholds)[^3] |
| [`dependencyExtractor`](https://jestjs.io/docs/configuration#dependencyextractor-string) | ❌ | - |
| [`displayName`](https://jestjs.io/docs/configuration#displayname-string-object) | ❌ | - |
| [`errorOnDeprecated`](https://jestjs.io/docs/configuration#errorondeprecated-boolean) | ❌ | - |
| [`extensionsToTreatAsEsm`](https://jestjs.io/docs/configuration#extensionstotreatasesm-arraystring) | ❌ | - |

[^1]: Converted to `number`
[^2]: Forcefully transformed to `v8`
[^3]: `global` is extracted

## Acknowledgments

1. This project would not exist without the existence of this [Jest migration to Vitest gist](https://gist.github.com/wojtekmaj/6defa1f358daae28bd52b7b6dbeb7ab6)

## License

This project is licensed under the [MIT License](./LICENSE)

