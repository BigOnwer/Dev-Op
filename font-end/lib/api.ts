import type { AuthInput, CreateProjectInput, Note, Project, User } from "@/types/api";

const API_URL = "/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(body?.error ?? "Não foi possível concluir a solicitação.", response.status);
  return body as T;
}

export const api = {
  login: (input: AuthInput) => request<{ message: string }>("/login", { method: "POST", body: JSON.stringify(input) }),
  register: (input: AuthInput) => request<User>("/register", { method: "POST", body: JSON.stringify(input) }),
  getUser: () => request<User>("/user"),
  getProjects: () => request<Project[]>("/projects"),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (input: CreateProjectInput) => request<{ project: Project; createdRoadmapSteps: number }>("/projects", { method: "POST", body: JSON.stringify(input) }),
  completeStep: (stepId: string, state: boolean) => request<{ message: string; data: { count: number } }>(`/projects/${stepId}`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  }),
  askProjectQuestion: (input: { projectId: string; message: string; stepId?: string }) => request<{ message: string; data: string }>("/projects/chat", {
    method: "POST",
    body: JSON.stringify(input),
  }),
  createNote: (input: { projectId: string; note: string; stepId?: string }) => request<{ message: string; data: Note }>("/projects/note", {
    method: "POST",
    body: JSON.stringify(input),
  }),
  getProjectNotes: (projectId: string) => request<Note[]>(`/projects/${projectId}/notes`),
  getStepNotes: (stepId: string) => request<Note[]>(`/projects/steps/${stepId}/notes`),
  deleteNote: (noteId: string) => request<{ message: string }>(`/projects/note/${noteId}`, { method: "DELETE" }),
  updateUser: (name: string) => request<User>("/update-user", { method: "POST", body: JSON.stringify({ name }) }),
  updatePassword: (input: { lastPassword: string; newPassword: string }) => request<User>("/update-password", { method: "POST", body: JSON.stringify(input) }),
  uploadAvatar: (imagePatch: string) => request<User>("/upload-avatar", { method: "POST", body: JSON.stringify({ imagePatch }) }),
};
