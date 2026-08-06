import { z } from "zod";

const createUserInputSchema = z.strictObject({
  email: z.string().email().trim().min(5).max(100),
  name: z.string().trim().min(2).max(100),
  avatar: z.string().base64().optional(),
  password: z.string().trim().min(6).max(100),
});

/** Corpo permitido para POST /projects. */
export const createUserSchema = createUserInputSchema;

/** Modelo de usuário retornado pelo Prisma. */
export const userSchema = createUserInputSchema.extend({
  id: z.string().uuid(),
  email: z.string().email().trim().min(5).max(100),
  name: z.string().trim().min(2).max(100),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Corpo permitido para POST /projects/chat. */
export const loginSchema = z.strictObject({
  email: z.string().email().trim().min(5).max(100),
  password: z.string().trim().min(6).max(100),
});

/** Corpo permitido para POST /projects/note. */
export const updateNameSchema = z.strictObject({
  userId: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
});

/** Dados aceitos para alterar a conclusão de uma etapa. */
export const updatePasswordSchema = z.strictObject({
  userId: z.string().uuid(),
  lastPassword: z.string().trim().min(6).max(100),
  newPassword: z.string().trim().min(6).max(100),
});

export const updateAvatarSchema = z.strictObject({
  id: z.string().uuid(),
  avatar: z.string().base64(),
});


export type CreateUserInput = z.infer<typeof createUserSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
