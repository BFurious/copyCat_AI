// File to Maintain States of the actions

import { ActionStates } from "../shared/enum";
import { alterWhenRecordingStarted, alterWhenReplayStarted  } from "../UI/alterMainControls";

// State to prevent capturing actions during replay
let isReplaying = false;
let isRecording = false;


export function getStates() {
    return {
        isReplaying,
        isRecording
    }

}

export function updateState(stateKey: string, value: boolean) {
    switch (stateKey) {
        case ActionStates.REPLAY:
            isReplaying = value;
            break;
        case ActionStates.RECORD:
            isRecording = value;
            break;
        default:
            return new Error("Invalid state");
    }

}

export function resetStates() {
    isReplaying = false;
    isRecording = false;
}