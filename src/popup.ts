import browser from "webextension-polyfill";
import { RpcMessages } from "./shared/types";
import { alterWhenRecordingStarted, alterWhenReplayStarted } from "./UI/alterMainControls";


//creaitng a port to connect to the background script
const port = browser.runtime.connect({ name: "rpcPort" });
const KEEP_ALIVE_INTERVAL = 5000; // 5 seconds
let keepAliveInterval: number | undefined;

// keeping "rpcPort" alive
function startKeepAlive() {
  if (!keepAliveInterval) {
    keepAliveInterval = window.setInterval(() => {
      port.postMessage({ type: "keepAlive" });
    }, KEEP_ALIVE_INTERVAL);
  }
}

export function sendRpcMessage(message: RpcMessages): void {
  port.postMessage(message);
}

// Add event listeners for popup buttons
const startRecordingButton = document.getElementById("start-recording")as HTMLButtonElement;
const stopRecordingButton = document.getElementById("stop-recording")as HTMLButtonElement;
const replayRecordingButton = document.getElementById("replay-recording") as HTMLButtonElement;
const clearRecordingButton = document.getElementById("clear-recording")as HTMLButtonElement;

if (startRecordingButton) {
  startRecordingButton.onclick = () => {
    alterWhenRecordingStarted(startRecordingButton, replayRecordingButton, stopRecordingButton);
    sendRpcMessage({ type: "startRecording" });
  };
}

if (stopRecordingButton) {
  stopRecordingButton.onclick = () => {
    alterWhenRecordingStarted(startRecordingButton, replayRecordingButton, stopRecordingButton);
    sendRpcMessage({ type: "stopRecording" });
  };
}

if (replayRecordingButton) {
  replayRecordingButton.onclick = () => {
    alterWhenReplayStarted(startRecordingButton, replayRecordingButton);
    sendRpcMessage({ type: "replayRecording" });
    alterWhenReplayStarted(startRecordingButton, replayRecordingButton);
  };
}


startKeepAlive();