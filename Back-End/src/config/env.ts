import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(8080),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string()
    .min(32, "JWT_SECRET precisa ter pelo menos 32 caracteres.")
    .refine((value) => !/^\d+$/.test(value), {
      message: "JWT_SECRET não pode conter apenas números.",
    }),

  IA_API_KEY: z.string().trim().min(1),

  CORS_ORIGIN: z.string()
    .url()
    .default("http://localhost:3000"),

  // Use esta variável se o Cloudinary estiver configurado por URL.
  CLOUDINARY_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Configuração de ambiente inválida:");

  for (const issue of parsedEnv.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  throw new Error("Não foi possível iniciar a aplicação.");
}

export const env = parsedEnv.data;