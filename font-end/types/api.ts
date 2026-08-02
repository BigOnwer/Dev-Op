export type Language = "TYPESCRIPT" | "JAVASCRIPT" | "PYTHON" | "JAVA" | "GO" | "CSHARP" | "PHP" | "RUBY" | "RUST" | "KOTLIN";
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface RoadmapStep {
  id: string;
  step: number;
  title: string;
  description: string;
  technologies: JsonValue;
  libraries: JsonValue;
  designPatterns: JsonValue;
  architectureConcepts: JsonValue;
  folderStructure: JsonValue;
  filesToCreate: JsonValue;
  implementationGuide: JsonValue;
  bestPractices: JsonValue;
  commonMistakes: JsonValue;
  studyTopics: JsonValue;
  estimatedTime: string;
  completionCriteria: JsonValue;
  nextStep: string;
  completed: boolean;
  projectId: string;
}

export interface Note {
  id: string;
  content: string;
  projectId: string | null;
  stepId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus | null;
  level: Level;
  framework: string;
  language: Language;
  userId: string;
  createdAt: string;
  updatedAt: string;
  RoadmapSteps?: RoadmapStep[];
}

export interface CreateProjectInput {
  name: string;
  description: string;
  language: Language;
  framework: string;
  level: Level;
}

export interface User { id: string; name: string; email: string; avatar?: string | null; createdAt?: string; }
export interface AuthInput { name?: string; email: string; password: string; }
