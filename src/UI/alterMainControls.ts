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
        // Create a table row for the project name
        const projectRow = document.createElement("tr");
        const projectCell = document.createElement("td");
        projectCell.colSpan = 4; // Span across all columns
        projectCell.textContent = projectName;
        projectCell.style.cursor = "pointer";
        projectRow.appendChild(projectCell);
        recordingList.appendChild(projectRow);

        // Create a container for the actions
        const actionsContainer = document.createElement("tbody");
        actionsContainer.style.display = "none"; // Hide initially

        actions.forEach((action) => {
            const { tabId, timestamp, action: actionDetails } = action;
            const { actionType, selector } = actionDetails;

            // Create a table row for each action
            const actionRow = document.createElement("tr");

            // Add Title (timestamp in readable format)
            const titleCell = document.createElement("td");
            const readableTimestamp = new Date(timestamp).toLocaleString();
            titleCell.textContent = readableTimestamp;
            actionRow.appendChild(titleCell);

            // Add Tab ID
            const tabIdCell = document.createElement("td");
            tabIdCell.textContent = tabId.toString();
            actionRow.appendChild(tabIdCell);

            // Add Action Type
            const actionTypeCell = document.createElement("td");
            actionTypeCell.textContent = actionType;
            actionRow.appendChild(actionTypeCell);

            // Add XPath
            const xPathCell = document.createElement("td");
            xPathCell.textContent = selector || "N/A";
            actionRow.appendChild(xPathCell);

            // Append the action row to the actions container
            actionsContainer.appendChild(actionRow);
        });

        // Append the actions container to the table body
        recordingList.appendChild(actionsContainer);

        // Add click event to toggle the visibility of the actions
        projectCell.addEventListener("click", () => {
            actionsContainer.style.display = actionsContainer.style.display === "none" ? "table-row-group" : "none";
        });
    });
}
