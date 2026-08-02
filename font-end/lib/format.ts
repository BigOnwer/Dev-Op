import type { JsonValue, Language, Level, ProjectStatus } from "@/types/api";

const languageLabels: Record<Language, string> = { TYPESCRIPT: "TypeScript", JAVASCRIPT: "JavaScript", PYTHON: "Python", JAVA: "Java", GO: "Go", CSHARP: "C#", PHP: "PHP", RUBY: "Ruby", RUST: "Rust", KOTLIN: "Kotlin" };
const levelLabels: Record<Level, string> = { BEGINNER: "Iniciante", INTERMEDIATE: "Intermediário", ADVANCED: "Avançado" };
const statusLabels: Record<ProjectStatus, string> = { PLANNING: "Planejamento", IN_PROGRESS: "Em andamento", COMPLETED: "Concluído", PAUSED: "Pausado" };

export const humanize = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
export const languageLabel = (language: Language) => languageLabels[language];
export const levelLabel = (level: Level) => levelLabels[level];
export const statusLabel = (status: ProjectStatus | null) => status ? statusLabels[status] : "Planejamento";
export const asList = (value: JsonValue): string[] => Array.isArray(value) ? value.map((item) => typeof item === "string" ? item : JSON.stringify(item)) : typeof value === "string" ? [value] : [];
export const percentage = (complete: number, total: number) => total ? Math.round((complete / total) * 100) : 0;
