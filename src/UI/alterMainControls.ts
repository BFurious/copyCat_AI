//Altering Frontend template
// import { startRecordingButton, replayRecordingButton, stopRecordingButton } from "../popup";
// not showing stop button in place of record button when recording started
export function alterWhenRecordingStarted(startRecordingButton: HTMLButtonElement, replayRecordingButton: HTMLButtonElement, stopRecordingButton: HTMLButtonElement) {
    startRecordingButton!.style.display = startRecordingButton!.style.display == "none" ? "block" : "none";
    stopRecordingButton!.style.display = stopRecordingButton!.style.display =="block" ? "none" : "block";
    replayRecordingButton!.disabled = replayRecordingButton!.disabled == true  ? false : true;
}

// disabling the replay and record button when replay started
export function alterWhenReplayStarted(startRecordingButton: HTMLButtonElement, replayRecordingButton: HTMLButtonElement){
    replayRecordingButton!.textContent = replayRecordingButton!.textContent == "Replaying.." ? "Replay" : "Replaying..";
    replayRecordingButton!.disabled = replayRecordingButton!.disabled == true ? false : true;
    startRecordingButton!.disabled = startRecordingButton!.disabled  == true ?  false : true;
}
