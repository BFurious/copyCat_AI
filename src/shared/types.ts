
import { Runtime } from "webextension-polyfill";

export type RpcMessages = 
    | { type: "startRecording" }
    | { type: "stopRecording" }
    | { type: "replayRecording" }
    | { type: "loadProjects", data: any }
    | { type: "saveProject"; name: string }
    | { type: "renameProject"; oldName: string; newName: string }
    | { type: "deleteProject"; name: string }
    | { type: "replayUserAction"; actionDetails: UserAction }
    | { type: "userAction"; actionDetails: UserAction }
    | { type: "startKeepAlive";};

export type UserAction = {
    tabId: number,
    timestamp: number,
    action: {
        actionType: UserActionType,
        selector?: string,
        inputValue?: string,
        coordinates?: {
            x?: number,
            y?: number
        },
        key?: string,
        code?: number,
        url?: string
    }
};

export type UserActionType = "click" | "scroll" | "hover" | "navigate" | "input" | "select" | "tabSwitch" | "navigation" | "focus" | "blur" | "keydown";

export interface Project {
    name: string;
    actions: UserAction[];
}

export type RpcHandler = (message: RpcMessages, port: Runtime.Port) => void;