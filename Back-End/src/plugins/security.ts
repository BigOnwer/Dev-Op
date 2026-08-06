import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from '@fastify/rate-limit'
import cors from "@fastify/cors";
import multipart from '@fastify/multipart';
import { env } from "../config/env.js";

export async function registerSecurity(app: FastifyInstance) {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
}

export async function RateRequestLimit(app: FastifyInstance) {
    await app.register(rateLimit, {
        max: 50,
        timeWindow: 60000
    })
}

const rateLimitPolicies = {
  login: {
    max: 5,
    timeWindow: "15 minutes",
  },

  register: {
    max: 3,
    timeWindow: "1 hour",
  },

  createProject: {
    max: 3,
    timeWindow: "15 minutes",
  },

  chatWithAi: {
    max: 15,
    timeWindow: "1 minute",
  },
} as const;

export function withRateLimit(
  policy: keyof typeof rateLimitPolicies,
) {
  return {
    config: {
      rateLimit: rateLimitPolicies[policy],
    },
  };
}

export async function CorsConfig(app: FastifyInstance) {
    await app.register(cors, {
    origin: [
        env.CORS_ORIGIN,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });
}

export async function limitRequest(app: FastifyInstance) {
    await app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
      }
    })
}