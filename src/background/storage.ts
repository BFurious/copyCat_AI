// File to maintain Storage Actions

import { Project, UserAction } from "../shared/types";
import browser from "webextension-polyfill";

// Save project with uniqueness handling
export async function saveProject(name: string, actions: UserAction[], oldData: { [key: string]: UserAction[] }): Promise<{ [key: string]: UserAction[] }> {
  let newData: { [key: string]: UserAction[] } = {};

  // Check if there is any existing project data
  if (Object.keys(oldData).length === 0) {
    // No previous data, so just set the new project
    newData[name] = actions;
  } else {
    // Handle name uniqueness
    let projectName = name;
    let number = 1;

    // Check for existing project names
    while (oldData[projectName]) {
      projectName = `${name}_${number}`;
      number++;
    }

    // Set the new project with a unique name
    oldData[projectName] = actions;
    newData = { ...oldData }; // Copy oldData into newData to keep previous data intact
  }

  // Save the data to local storage
  await browser.storage.local.set({ projects: newData });

  return newData; // Return the updated data
}


// Load projects from storage
export async function loadProjects() {
  const result = await browser.storage.local.get("projects");

  // Convert the stored object back to Map for in-memory use
  const projectsData = result.projects;

  // Convert object back to Map
  return projectsData || {};
}


// Delete a project from storage
export async function deleteProject(name: string): Promise<void> {
  const projects = await getProjects();
  if (projects[name]) {
    delete projects[name];
    await browser.storage.local.set({ projects });
  }
}

// Rename a project in storage
export async function renameProject(oldName: string, newName: string): Promise<void> {
  const projects = await getProjects();
  if (projects[oldName]) {
    projects[newName] = { ...projects[oldName], name: newName };
    delete projects[oldName];
    await browser.storage.local.set({ projects });
  }
}

// Helper to get all projects
async function getProjects(): Promise<Record<string, Project>> {
  const result = await browser.storage.local.get("projects");
  return (result.projects as Record<string, Project>) || {};
}
