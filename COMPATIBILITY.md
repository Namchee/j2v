# Jest Compatibility Table

Below are the list of compatible Jest's API that can be transformed. List of API are taken from [official Jest documentation](https://jestjs.io/docs)

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

### Jest API

| API | Supported? | Transformed To |
| --- | :--------: | -------------- |
| [`disableAutoMock`](https://jestjs.io/docs/jest-object#jestdisableautomock) | ❌ | - |
| [`enableAutoMock`](https://jestjs.io/docs/jest-object#jestenableautomock) | ❌ | - |
| [`createMockFromModule`](https://jestjs.io/docs/jest-object#jestcreatemockfrommodulemodulename) | ❌ | - |
| [`mock`](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options) | ✅ | [`mock`](https://vitest.dev/api/vi.html#vi-mock) |
| [`mocked`](https://jestjs.io/docs/jest-object#jestmockedsource-options) | ✅ | [`mocked`](https://vitest.dev/api/vi.html#vi-mocked) |
| [`unmock`](https://jestjs.io/docs/jest-object#jestunmockmodulename) | ✅ | [`unmock`](https://vitest.dev/api/vi.html#vi-unmock) |
| [`deepUnmock`](https://jestjs.io/docs/jest-object#jestdeepunmockmodulename) | ❌ | - |
| [`doMock`](https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options) | ✅ | [`doMock`](https://vitest.dev/api/vi.html#vi-domock) |
| [`dontMock`](https://jestjs.io/docs/jest-object#jestdontmockmodulename) | ❌ | - |
| [`setMock`](https://jestjs.io/docs/jest-object#jestsetmockmodulename-moduleexports) | ❌ | - |
| [`requireActual`](https://jestjs.io/docs/jest-object#jestrequireactualmodulename) | ✅ | [`importActual`](https://vitest.dev/api/vi.html#vi-importactual)[^9] |
| [`requireMock`](https://jestjs.io/docs/jest-object#jestrequiremockmodulename) | ✅ | [`importMock`](https://vitest.dev/api/vi.html#vi-importmock)[^9] |
| [`resetModules`](https://jestjs.io/docs/jest-object#jestresetmodules) | ✅ | [`resetModules`](https://vitest.dev/api/vi.html#vi-resetmodules) |
| [`isolateModules`](https://jestjs.io/docs/jest-object#jestisolatemodulesfn) | ❌ | - |
| [`isolateModulesAsync`](https://jestjs.io/docs/jest-object#jestisolatemodulesasyncfn) | ❌ | - |
| [`fn`](https://jestjs.io/docs/jest-object#jestfnimplementation) | ✅ | [`fn`](https://vitest.dev/api/vi.html#vi-fn) |
| [`isMockFunction`](https://jestjs.io/docs/jest-object#jestismockfunctionfn) | ✅ | [`isMockFunction`](https://vitest.dev/api/vi.html#vi-ismockfunction) |
| [`replaceProperty`](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value) | ❌ | - |
| [`spyOn`](https://jestjs.io/docs/jest-object#jestspyonobject-methodname) | ✅ | [`spyOn`](https://vitest.dev/api/vi.html#vi-spyon) |
| [`clearAllMocks`](https://jestjs.io/docs/jest-object#jestclearallmocks) | ✅ | [`clearAllMocks`](https://vitest.dev/api/vi.html#vi-clearallmocks) |
| [`resetAllMocks`](https://jestjs.io/docs/jest-object#jestresetallmocks) | ✅ | [`resetAllMocks`](https://vitest.dev/api/vi.html#vi-resetallmocks) |
| [`restoreAllMocks`](https://jestjs.io/docs/jest-object#jestrestoreallmocks) | ✅ | [`restoreAllMocks`](https://vitest.dev/api/vi.html#vi-restoreallmocks) |
| [`useFakeTimers`](https://jestjs.io/docs/jest-object#jestusefaketimersfaketimersconfig) | ✅ | [`useFakeTimers`](https://vitest.dev/api/vi.html#vi-usefaketimers)[^4] |
| [`useRealTimers`](https://jestjs.io/docs/jest-object#jestuserealtimers) | ✅ | [`useRealTimers`](https://vitest.dev/api/vi.html#vi-userealtimers) |
| [`runAllTicks`](https://jestjs.io/docs/jest-object#jestrunallticks) | ✅ | [`runAllTicks`](https://vitest.dev/api/vi.html#vi-runallticks) |
| [`runAllTimers`](https://jestjs.io/docs/jest-object#jestrunalltimers) | ✅ | [`runAllTimers`](https://vitest.dev/api/vi.html#vi-runalltimers) |
| [`runAllTimersAsync`](https://jestjs.io/docs/jest-object#jestrunalltimersasync) | ✅ | [`runAllTimersAsync`](https://vitest.dev/api/vi.html#vi-runalltimersasync) |
| [`runAllImmediates`](https://jestjs.io/docs/jest-object#jestrunallimmediates) | ❌ | - |
| [`advanceTimersByTime`](https://jestjs.io/docs/jest-object#jestadvancetimersbytimemstorun) | ✅ | [`advanceTimersByTime`](https://vitest.dev/api/vi.html#vi-advancetimersbytime) |
| [`advanceTimersByTimeAsync`](https://jestjs.io/docs/jest-object#jestadvancetimersbytimeasyncmstorun) | ✅ | [`advanceTimersByTimeAsync`](https://vitest.dev/api/vi.html#vi-advancetimersbytimeasync) |
| [`runOnlyPendingTimers`](https://jestjs.io/docs/jest-object#jestrunonlypendingtimers) | ✅ | [`runOnlyPendingTimers`](https://vitest.dev/api/vi.html#vi-runonlypendingtimers) |
| [`runOnlyPendingTimersAsync`](https://jestjs.io/docs/jest-object#jestrunonlypendingtimersasync) | ✅ | [`runOnlyPendingTimersAsync`](https://vitest.dev/api/vi.html#vi-runonlypendingtimersasync) |
| [`advanceTimersToNextTimer`](https://jestjs.io/docs/jest-object#jestadvancetimerstonexttimersteps) | ✅ | [`advanceTimersToNextTimer`](https://vitest.dev/api/vi.html#vi-advancetimerstonexttimer) |
| [`advanceTimersToNextTimerAsync`](https://jestjs.io/docs/jest-object#jestadvancetimerstonexttimerasyncsteps) | ✅ | [`advanceTimersToNextTimerAsync`](https://vitest.dev/api/vi.html#vi-advancetimerstonexttimerasync) |
| [`getTimerCount`](https://jestjs.io/docs/jest-object#jestgettimercount) | ✅ | [`getTimerCount`](https://vitest.dev/api/vi.html#vi-gettimercount) |
| [`now`](https://jestjs.io/docs/jest-object#jestnow) | ❌ | - |
| [`setSystemTime`](https://jestjs.io/docs/jest-object#jestsetsystemtimenow-number--date) | ✅ | [`setSystemTime`](https://vitest.dev/api/vi.html#vi-setsystemtime) |
| [`getRealSystemTime`](https://jestjs.io/docs/jest-object#jestgetrealsystemtime) | ❌ | - |
| [`getSeed`](https://jestjs.io/docs/jest-object#jestgetseed) | ❌ | - |
| [`isEnvironmentTornDown`](https://jestjs.io/docs/jest-object#jestisenvironmenttorndown) | ❌ | - |
| [`retryTimes`](https://jestjs.io/docs/jest-object#jestretrytimesnumretries-options) | ❌ | - |
| [`setTimeout`](https://jestjs.io/docs/jest-object#jestsettimeouttimeout) | ✅ | [`setConfig`](https://vitest.dev/guide/migration.html#timeout) |

### Jest Types

| Types | Supported? |
| ----- | :--------: |
| [`Mock`](https://jestjs.io/docs/mock-function-api#jestmockt) | ✅ |
| [`Mocked`](https://jestjs.io/docs/jest-object#jestmockedsource) | ✅ |
| [`Replaced`](https://jestjs.io/docs/mock-function-api#jestreplacedsource) | ❌ |
| [`Spied`](https://jestjs.io/docs/mock-function-api#jestspiedsource) | ❌ |

[^1]: Converted to `number`
[^2]: Forcefully transformed to `v8`
[^3]: `global` is extracted
[^4]: [See transformer here](./src/mapper.ts)
[^5]: Forcefully set to `false` by default, but can be enabled by passing `global` flag in the CLI
[^6]: Only supported if provided via CLI
[^7]: You need to convert each of them manually to [ESM format](https://vitest.dev/guide/snapshot#custom-serializer)
[^8]: `threads` if `true`, `forks` otherwise.
[^9]: Transformed into an `async` function
