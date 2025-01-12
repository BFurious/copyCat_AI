// file to maintain background script of extension

import browser, { Runtime } from "webextension-polyfill";
import { RpcMessages, RpcHandler, UserAction } from "../shared/types";
import { saveProject, loadProjects, deleteProject, renameProject } from "./storage";
import { updateState, getStates, resetStates } from "../util/states";
import { ActionStates } from "../shared/enum";


const listeners: RpcHandler[] = [];
const recordedActions: UserAction[] = [];

// Load projects from storage
// Using .then for promise handling
let DbData: { [key: string]: UserAction[] } | {};

loadProjects()
  .then((data) => {
    DbData = data;
    console.log("Loaded Projects:", DbData);
  })
  .catch((error) => {
    console.error("Failed to load projects:", error);
  });


let rpcPort: Runtime.Port;

// Map to track content script ports per tab
const contentScriptPorts: Map<number, Runtime.Port> = new Map();

// Listen for connections from other scripts
browser.runtime.onConnect.addListener((port: Runtime.Port) => {
  if (port.name === "keepAlive") {
    return;
  }

  if (port.name === "rpcPort") {
    // Handle popup or other UI scripts
    rpcPort = port;
    sendRpcMessageResponse({ type: "loadProjects", data : DbData }, rpcPort);
    port.onMessage.addListener((msg: unknown) => {
      for (const listener of listeners) {
        listener(msg as RpcMessages, port);
      }
    });
    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port.name);
      resetStates();
    });
  } else {
    throw new Error("Unknown port.");
  }

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId) {
      contentScriptPorts.set(tabId, port);
      browser.tabs.sendMessage(tabId, { action: "startKeepAlive" });
    }
  });

});


// Accept any response message from the browser scripts
browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === "getActiveTab") {
    browser.tabs.query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs.length > 0 && tabs[0].id !== undefined) {
          sendResponse(tabs[0].id); // Send the tab ID as the response
        } else {
          sendResponse(undefined); // No active tab found
        }
      })
      .catch((error) => {
        console.error("Error querying tabs:", error);
        sendResponse(undefined); // Handle errors gracefully
      });
    return true; // Keep the message channel open for async responses
  }
});


// Listen for browser action (toolbar icon) clicks
browser.action.onClicked.addListener(() => {
  // Open a popup window
  browser.windows.create({
    url: browser.runtime.getURL("../popup.html"), // Path to your HTML file
    type: "popup", // Options: 'popup', 'normal', 'panel', etc.
    width: 400,
    height: 600,
  });
});


// Track tab switches or updates (e.g., redirection)
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const { isRecording } = getStates();
  if (isRecording) {
    const tab = await browser.tabs.get(activeInfo.tabId);
    recordedActions.push({
      tabId: activeInfo.tabId,
      timestamp: Date.now(),
      action: { actionType: "tabSwitch", url: tab.url },
    });
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { isRecording } = getStates();
  if (changeInfo.url && isRecording) {
    recordedActions.push({
      tabId,
      timestamp: Date.now(),
      action: { actionType: "navigation", url: changeInfo.url },
    });
  }
});


// Add an RPC listener
export function addRpcListener(handler: RpcHandler): void {
  listeners.push(handler);
}

// Remove an RPC listener
export function removeRpcListener(handler: RpcHandler): void {
  const index = listeners.indexOf(handler);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}

// Send an RPC message response
export function sendRpcMessageResponse(message: RpcMessages, port: Runtime.Port): void {
  port.postMessage(message);
}

// Send a message to all connected content scripts
async function broadcastMessageToContentScripts(message: { type: "replayUserAction"; actionDetails: UserAction }) {
  try {
    await browser.tabs.sendMessage(message.actionDetails.tabId, message);
  } catch (error) {
    console.error(`Failed to send message to tab ${message.actionDetails.tabId}:`, error);
    contentScriptPorts.delete(message.actionDetails.tabId); // Remove disconnected port
  }
}

// Define RPC handlers
addRpcListener(async (message, port) => {
  const { isRecording, isReplaying } = getStates();
  switch (message.type) {
    case "startRecording":
      recordedActions.length = 0; // Clear previous actions
      updateState(ActionStates.RECORD, true);
      console.log("Recording started");
      break;

    case "stopRecording":
      updateState(ActionStates.RECORD, false);
      console.log("Recording stopped", recordedActions);
      DbData = await saveProject("Test Project", recordedActions, DbData);
      sendRpcMessageResponse({ type: "loadProjects", data : DbData }, rpcPort);
      break;

    case "replayRecording":
      console.log("Replaying actions", recordedActions);
      updateState(ActionStates.REPLAY, true);
      recordedActions.forEach((actionDetails) => {
        broadcastMessageToContentScripts({ type: "replayUserAction", actionDetails });
      });
      updateState(ActionStates.REPLAY, false);
      break;

    case "userAction":
      if (!isRecording) {
        return;
      }
      recordedActions.push(message.actionDetails!);
      break;
  }
});