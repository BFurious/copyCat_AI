// File to maintain the browser tab script Every tab will have this script added
// Navigate content script section ro debug 

import browser from "webextension-polyfill";
import { sendRpcMessage } from "../popup";
import { replayRecording, getXPath } from "../util/helper";
import { RpcMessages } from "../shared/types";
import { keepScriptAlive } from "./keepAlive";

// Listen for replay messages
browser.runtime.onMessage.addListener(async (msg: unknown) => {
  const message = msg as RpcMessages;
  if (message.type === "replayUserAction") {
    try {
      await replayRecording(message.actionDetails);
      console.log("Replayed action:", message.actionDetails);
    } catch (error) {
      console.error("Error replaying action:", error);
    }
  } else if (message.type == "startKeepAlive") {
    keepScriptAlive();
  }
});

// Capture user actions and send to the background script
function captureUserActions(tabId: number) {
  const sendAction = (actionType: string, details: any) => {
    sendRpcMessage({
      type: "userAction",
      actionDetails: {
        tabId,
        timestamp: Date.now(),
        action: { actionType, ...details }
      },
    });
  };

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    sendAction("click", { selector: getXPath(target) });
  });

  document.addEventListener("input", (e) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      sendAction("input", { selector: getXPath(target), inputValue: target.value });
    }
  });

  window.addEventListener("beforeunload", () => {
    sendAction("navigation", { url: window.location.href });
  });

  document.addEventListener("focus", (e) => {
    const target = e.target as HTMLElement;
    sendAction("focus", { selector: getXPath(target) });
  }, true);

  document.addEventListener("blur", (e) => {
    const target = e.target as HTMLElement;
    sendAction("blur", { selector: getXPath(target) });
  }, true);

  document.addEventListener("scroll", () => {
    sendAction("scroll", { coordinates: { x: window.scrollX, y: window.scrollY } });
  });

  document.addEventListener("mouseover", (e) => {
    const target = e.target as HTMLElement;
    sendAction("hover", { selector: getXPath(target) });
  });

  document.addEventListener("keydown", (e) => {
    sendAction("keydown", { key: e.key, code: e.code });
  });

  document.addEventListener("change", (e) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLSelectElement) {
      sendAction("select", { selector: getXPath(target), value: target.value });
    }
  });
}

// Initialize the script
browser.runtime.sendMessage({ type: "getActiveTab" }).then((tabId) => {
  const id = tabId as number;
  if (id !== undefined) {
    captureUserActions(id);
  } else {
    console.error("No active tab found.");
  }
});

// Keep the content script alive
keepScriptAlive();

