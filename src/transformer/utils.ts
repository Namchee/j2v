import advanceTimersByTime from "./utils/advanceTimersByTime";
import advanceTimersByTimeAsync from "./utils/advanceTimersByTimeAsync";
import advanceTimersToNextTimer from "./utils/advanceTimersToNextTimer";
import advanceTimersToNextTimerAsync from "./utils/advanceTimersToNextTimerAsync";
import clearAllMocks from "./utils/clearAllMocks";
import clearAllTimers from "./utils/clearAllTimers";
import disableAutomock from "./utils/disableAutomock";
import doMock from "./utils/doMock";
import doUnmock from "./utils/doUnmock";
import enableAutomock from "./utils/enableAutomock";
import fn from "./utils/fn";
import getTimerCount from "./utils/getTimerCount";
import isMockFunction from "./utils/isMockFunction";
import mock from "./utils/mock";
import mocked from "./utils/mocked";
import requireActual from "./utils/requireActual";
import requireMock from "./utils/requireMock";
import resetAllMocks from "./utils/resetAllMocks";
import restoreAllMocks from "./utils/restoreAllMocks";
import runAllTicks from "./utils/runAllTicks";
import runAllTimers from "./utils/runAllTimers";
import runAllTimersAsync from "./utils/runAllTimersAsync";
import runOnlyPendingTimers from "./utils/runOnlyPendingTimers";
import runOnlyPendingTimersAsync from "./utils/runOnlyPendingTimersAsync";
import setTimeout from "./utils/setTimeout";
import spyOn from "./utils/spyOn";
import unmock from "./utils/unmock";
import useFakeTimers from "./utils/useFakeTimers";
import useRealTimers from "./utils/useRealTimers";

import type { CallExpressionReplacer } from "../transformer";

export const JEST_UTILITIES: Record<string, CallExpressionReplacer> = {
  advanceTimersByTime,
  advanceTimersByTimeAsync,
  advanceTimersToNextTimer,
  advanceTimersToNextTimerAsync,
  clearAllMocks,
  clearAllTimers,
  disableAutomock,
  doMock,
  doUnmock,
  enableAutomock,
  fn,
  getTimerCount,
  isMockFunction,
  mock,
  mocked,
  requireActual,
  requireMock,
  resetAllMocks,
  restoreAllMocks,
  runAllTicks,
  runAllTimers,
  runAllTimersAsync,
  runOnlyPendingTimers,
  runOnlyPendingTimersAsync,
  setTimeout,
  spyOn,
  unmock,
  useFakeTimers,
  useRealTimers,
};
