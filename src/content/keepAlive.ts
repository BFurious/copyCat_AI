
/**
 * While a CBA project is being executed Service worker should be kept alive. It
 * has been observed that service worker is being killed by the browser on
 * `click-update` and `update` actions, breaking our user workflow which
 * involves project with repeating run and relying on page update triggered by
 * the user .
 */

import { browser } from "webextension-polyfill-ts";
import { getStates } from "../util/states";


let keepAlivePort: any;
let postTimer: any;
export async function keepScriptAlive() {
  const state = await getStates();
  if (state === null) {
    return;
  }
  // If project is playing or paused, keep service worker alive.
  if (state && (state.isRecording || state.isReplaying)) {
    keepAlivePort = browser.runtime.connect({name: 'keepAlive'});
    postTimer = window.setTimeout(keepScriptAlive, 15000);
  } else {
    if (keepAlivePort) {
      keepAlivePort.disconnect();
      keepAlivePort = null;
    }
    if (postTimer) {
      window.clearTimeout(postTimer);
      postTimer = null;
    }
  }
}

