import { z } from "zod";

export const languageSchema = z.enum([
  "TYPESCRIPT",
  "JAVASCRIPT",
  "PYTHON",
  "JAVA",
  "GO",
  "CSHARP",
  "PHP",
  "RUBY",
  "RUST",
  "KOTLIN",
]);

export const frameworkSchema = z.enum([
  "NEXTJS",
  "NESTJS",
  "FASTIFY",
  "EXPRESS",
  "HONO",
  "REACT",
  "VUE",
  "ANGULAR",
  "EXPRESS_JS",
  "KOA",
  "SVELTE",
  "ADONISJS",
  "DJANGO",
  "FASTAPI",
  "FLASK",
  "LITESTAR",
  "SPRING_BOOT",
  "QUARKUS",
  "MICRONAUT",
  "GIN",
  "FIBER",
  "ECHO",
  "CHI",
  "ASP_NET_CORE",
  "LARAVEL",
  "SYMFONY",
  "RAILS",
  "SINATRA",
  "ACTIX_WEB",
  "AXUM",
  "KTOR",
]);

export const levelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const projectStatusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "PAUSED",
]);

const projectInputSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2_000),
  language: languageSchema,
  framework: frameworkSchema,
  level: levelSchema,
});

/** Corpo permitido para POST /projects. */
export const createProjectSchema = projectInputSchema;

/** Modelo de projeto retornado pelo Prisma. */
export const projectSchema = projectInputSchema.extend({
  id: z.string().uuid(),
  status: projectStatusSchema.nullable(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Corpo permitido para POST /projects/chat. */
export const projectChatSchema = z.strictObject({
  projectId: z.string().uuid(),
  message: z.string().trim().min(1).max(4_000),
  stepId: z.string().uuid().optional(),
});

/** Corpo permitido para POST /projects/note. */
export const createNoteSchema = z.strictObject({
  projectId: z.string().uuid(),
  note: z.string().trim().min(1).max(5_000),
  stepId: z.string().uuid().optional(),
});

/** Dados aceitos para alterar a conclusão de uma etapa. */
export const completeStepSchema = z.strictObject({
  state: z.boolean(),
});

export const idParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const stepIdParamsSchema = z.strictObject({
  stepId: z.string().uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectChatInput = z.infer<typeof projectChatSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CompleteStepInput = z.infer<typeof completeStepSchema>;
