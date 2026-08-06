import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/app-errors.js";

export async function authenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError();
  }
}
