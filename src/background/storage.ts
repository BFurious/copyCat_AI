// File to maintain Storage Actions

import { Project } from "../shared/types";
import browser from "webextension-polyfill";

// Save a project to storage
export async function saveProject(name: string, actions: Project["actions"]): Promise<void> {
  const projects = (await getProjects()) ?? {};
  projects[name] = { name, actions };
  await browser.storage.local.set({ projects });
}

// Load all projects from storage
export async function loadProjects(): Promise<Record<string, Project>> {
  const result = await browser.storage.local.get("projects");
  return (result.projects as Record<string, Project>) || {};
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
