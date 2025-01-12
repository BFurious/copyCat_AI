//Altering Frontend template
import { UserAction } from "../shared/types";

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


export function populateRecordingList(recordedActions: { [key: string]: UserAction[] }) {
    const recordingList = document.getElementById("recording-list");

    if (!recordingList) {
        console.error("Recording list element not found");
        return;
    }

    // Clear existing rows
    recordingList.innerHTML = "";

    // Loop through each project in the recorded actions
    Object.entries(recordedActions).forEach(([projectName, actions]) => {
        actions.forEach((action) => {
            const { tabId, timestamp, action: actionDetails } = action;
            const { actionType, selector } = actionDetails;

            // Create a table row
            const row = document.createElement("tr");

            // Add Title (timestamp in readable format)
            const titleCell = document.createElement("td");
            const readableTimestamp = new Date(timestamp).toLocaleString();
            titleCell.textContent = readableTimestamp;
            row.appendChild(titleCell);

            // Add Tab ID
            const tabIdCell = document.createElement("td");
            tabIdCell.textContent = tabId.toString();
            row.appendChild(tabIdCell);

            // Add Action Type
            const actionTypeCell = document.createElement("td");
            actionTypeCell.textContent = actionType;
            row.appendChild(actionTypeCell);

            // Add XPath
            const xPathCell = document.createElement("td");
            xPathCell.textContent = selector || "N/A";
            row.appendChild(xPathCell);

            // Append the row to the table body
            recordingList.appendChild(row);
        });
    });
}
