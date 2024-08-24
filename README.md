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
| --- | :--------: | -------------- |
| `automock` | ❌ | - |
| [`bail`](https://jestjs.io/docs/configuration#bail-number--boolean) | ✅ | [`bail`](https://vitest.dev/config/#bail)[^1] |
| [`cacheDirectory`](https://jestjs.io/docs/configuration#cachedirectory-string) | ✅ | [`server.deps.cacheDir`](https://vitest.dev/config/#server-deps-cachedir) |
| [`clearMocks`](https://jestjs.io/docs/configuration#clearmocks-boolean) | ✅ | [`clearMocks`](https://vitest.dev/config/#clearmocks) |
| [`collectCoverage`](https://jestjs.io/docs/configuration#collectcoverage-boolean) | ✅ | [`coverage.enabled`](https://vitest.dev/config/#coverage-enabled) |
| [`collectCoverageFrom`](https://jestjs.io/docs/configuration#collectcoveragefrom-array) | ✅ | [`coverage.include`](https://vitest.dev/config/#coverage-include) |
| [`coverageDirectory`](https://jestjs.io/docs/configuration#coveragedirectory-string) | ✅ | [`coverage.reportsDirectory`](https://vitest.dev/config/#coverage-reportsdirectory) |
| [`coveragePathIgnorePatterns`](https://jestjs.io/docs/configuration#coveragepathignorepatterns-arraystring) | ✅ | [`coverage.exclude`](https://vitest.dev/config/#coverage-exclude) |
| [`coverageProvider`](https://jestjs.io/docs/configuration#coverageprovider-string) | 🟨 | [`coverage.provider`](https://vitest.dev/config/#coverage-provider)[^2] |
| [`coverageReporters`](https://vitest.dev/config/#coverage-provider) | ✅ | [`coverageReporter`](https://vitest.dev/config/#coverage-reporter) |
| [`coverageThreshold`](https://jestjs.io/docs/configuration#coveragethreshold-object) | ✅ | [`coverage.threshold`](https://vitest.dev/config/#coverage-thresholds)[^3] |
| [`dependencyExtractor`](https://jestjs.io/docs/configuration#dependencyextractor-string) | ❌ | - |
| [`displayName`](https://jestjs.io/docs/configuration#displayname-string-object) | ❌ | - |
| [`errorOnDeprecated`](https://jestjs.io/docs/configuration#errorondeprecated-boolean) | ❌ | - |
| [`extensionsToTreatAsEsm`](https://jestjs.io/docs/configuration#extensionstotreatasesm-arraystring) | ❌ | - |
| [`fakeTimers`](https://jestjs.io/docs/configuration#faketimers-object) | ✅ | [`fakeTimers`](https://vitest.dev/config/#faketimers)[^4] |
| [`forceCoverageMatch`](https://jestjs.io/docs/configuration#forcecoveragematch-arraystring) | ❌ | - |
| [`globals`](https://jestjs.io/docs/configuration#globals-object) | ✅ | [`globals`](https://vitest.dev/config/#globals) |
| [`globalSetup`](https://jestjs.io/docs/configuration#globalsetup-string) | ❌ | - |
| [`globalTeardown`](https://jestjs.io/docs/configuration#globalteardown-string) | ❌ | - |
| [`haste`](https://jestjs.io/docs/configuration#haste-object) | ❌ | - |
| [`injectGlobals`](https://jestjs.io/docs/configuration#injectglobals-boolean) | ✅ | [`globals`](https://vitest.dev/config/#globals)[^5] |
| [`maxConcurrency`](https://jestjs.io/docs/configuration#maxconcurrency-number) | ✅ | [`maxConcurrency`](https://vitest.dev/config/#maxconcurrency) |
| [`maxWorkers`](https://jestjs.io/docs/configuration#maxworkers-number--string) | ✅ | [`maxWorkers`](https://vitest.dev/config/#maxworkers) |
| [`moduleDirectories`](https://jestjs.io/docs/configuration#moduledirectories-arraystring) | ✅ | [`deps.moduleDirectories`](https://vitest.dev/config/#deps-moduledirectories) |
| [`moduleNameMapper`](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring) | ❌ | - |
| [`modulePathIgnorePatterns`](https://jestjs.io/docs/configuration#modulepathignorepatterns-arraystring) | ❌ | - |
| [`modulePaths`](https://jestjs.io/docs/configuration#modulepaths-arraystring) | ❌ | - |
| [`notify`](https://jestjs.io/docs/configuration#notify-boolean) | ❌ | - |
| [`notifyMode`](https://jestjs.io/docs/configuration#notifymode-string) | ❌ | - |
| [`openHandlesTimeout`](https://jestjs.io/docs/configuration#openhandlestimeout-number) | ✅ | [`teardownTimeout`](https://vitest.dev/config/#teardowntimeout) |
| [`preset`](https://jestjs.io/docs/configuration#preset-string) | ❌ | - |
| [`prettierPath`](https://jestjs.io/docs/configuration#prettierpath-string) | ❌ | - |
| [`projects`](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig) | 🟨 | [`project`](https://vitest.dev/guide/cli.html#project)[^6] |
| [`randomize`](https://jestjs.io/docs/configuration#randomize-boolean) | ✅ | [`sequence.shuffle.files`](https://vitest.dev/config/#sequence-shuffle-files) |
| [`reporters`](https://jestjs.io/docs/configuration#reporters-arraymodulename--modulename-options) | ❌ | - |
| [`resetMocks`](https://jestjs.io/docs/configuration#resetmocks-boolean) | ✅ | [`mockReset`](https://vitest.dev/config/#mockreset) |
| [`resetModules`](https://jestjs.io/docs/configuration#resetmodules-boolean) | ❌ | - |
| [`resolvers`](https://jestjs.io/docs/configuration#resolver-string) | ❌ | - |
| [`restoreMocks`](https://jestjs.io/docs/configuration#restoremocks-boolean) | ✅ | [`restoreMocks`](https://jestjs.io/docs/configuration#restoremocks-boolean) |
| [`rootDir`](https://jestjs.io/docs/configuration#rootdir-string) | ✅ | [`dir`](https://vitest.dev/config/#dir) |
| [`roots`](https://jestjs.io/docs/configuration#roots-arraystring) | ❌ | - |
| [`runner`](https://jestjs.io/docs/configuration#runner-string) | ❌ | - |
| [`sandboxInjectGlobals`](https://jestjs.io/docs/configuration#sandboxinjectedglobals-arraystring) | ❌ | - |
| [`setupFiles`](https://jestjs.io/docs/configuration#setupfiles-array) | ✅ | [`setupFiles`](https://vitest.dev/config/#setupfiles) |
| [`setupFilesAfterEnv`](https://jestjs.io/docs/configuration#setupfilesafterenv-array) | ❌ | - |
| [`showSeed`](https://jestjs.io/docs/configuration#showseed-boolean) | ❌ | - |
| [`slowTestThreshold`](https://jestjs.io/docs/configuration#slowtestthreshold-number) | ✅ | [`slowTestThreshold`](https://vitest.dev/config/#slowtestthreshold) |
| [`snapshotFormat`](https://jestjs.io/docs/configuration#snapshotformat-object) | ✅ | [`snapshotFormat`](https://jestjs.io/docs/configuration#snapshotformat-object) |
| [`snapshotResolver`](https://jestjs.io/docs/configuration#snapshotresolver-string) | ❌ | - |
| [`snapshotSerializers`](https://jestjs.io/docs/configuration#snapshotserializers-arraystring) | 🟨 | [`snapshotSerializers`](https://vitest.dev/config/#snapshotserializers)[^7] |
| [`testEnvironment`](https://jestjs.io/docs/configuration#testenvironment-string) | ✅ | [`environment`](https://vitest.dev/config/#environment) |
| [`testEnvironmentOptions`](https://jestjs.io/docs/configuration#testenvironmentoptions-object) | ✅ | [`environmentOptions`](https://vitest.dev/config/#environmentoptions) |
| [`testFailureExitCode`](https://jestjs.io/docs/configuration#testfailureexitcode-number) | ❌ | - |
| [`testMatch`](https://jestjs.io/docs/configuration#testmatch-arraystring) | ✅ | [`include`](https://vitest.dev/config/#include) |
| [`testMatchIgnorePatterns`](https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring) | ✅ | [`exclude`](https://vitest.dev/config/#exclude) |
| [`testRegex`](https://jestjs.io/docs/configuration#testregex-string--arraystring) | ❌ | - |
| [`testResultProcessor`](https://jestjs.io/docs/configuration#testresultsprocessor-string) | ❌ | - |
| [`testRunner`](https://jestjs.io/docs/configuration#testrunner-string) | ❌ | - |
| [`testSequencer`](https://jestjs.io/docs/configuration#testsequencer-string) | ❌ | - |
| [`testTimeout`](https://jestjs.io/docs/configuration#testtimeout-number) | ✅ | [`testTimeout`](https://vitest.dev/config/#testtimeout) |
| [`transform`](https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object) | ❌ | - |
| [`transformIgnorePatterns`](https://jestjs.io/docs/configuration#transformignorepatterns-arraystring) | ❌ | - |
| [`unmockedModulePathPatterns`](https://jestjs.io/docs/configuration#unmockedmodulepathpatterns-arraystring) | ❌ | - |
| [`verbose`](https://jestjs.io/docs/configuration#verbose-boolean) | ❌ | - |
| [`watchPathIgnorePatterns`](https://jestjs.io/docs/configuration#watchpathignorepatterns-arraystring) | ❌ | - |
| [`watchPlugins`](https://jestjs.io/docs/configuration#watchplugins-arraystring--string-object) | ❌ | - |
| [`watchman`](https://jestjs.io/docs/configuration#watchman-boolean) | ❌ | - |
| [`workerIdleMemoryLimit`](https://jestjs.io/docs/configuration#workeridlememorylimit-numberstring) | ✅ | [`poolOptions.vmThreads.memoryLimit`](https://vitest.dev/config/#pooloptions-vmthreads-memorylimit) |
| [`workerThreads`](https://jestjs.io/docs/configuration#workerthreads) | ✅ | [`pool`](https://vitest.dev/config/#pool)[^8] |

[^1]: Converted to `number`
[^2]: Forcefully transformed to `v8`
[^3]: `global` is extracted
[^4]: [See transfomer here](./src/mapper.ts)
[^5]: Forcefully set to `false` by default, but can be enabled by passing `global` flag in the CLI
[^6]: Only supported if provided via CLI
[^7]: You need to convert each of them manually to [ESM format](https://vitest.dev/guide/snapshot#custom-serializer)
[^8]: `threads` if `true`, `forks` otherwise.

## Acknowledgments

1. This project would not exist without the existence of this [Jest migration to Vitest gist](https://gist.github.com/wojtekmaj/6defa1f358daae28bd52b7b6dbeb7ab6)

## License

This project is licensed under the [MIT License](./LICENSE)

