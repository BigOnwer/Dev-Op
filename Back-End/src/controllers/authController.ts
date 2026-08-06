import type { FastifyReply, FastifyRequest } from "fastify";
import { createUserSchema, loginSchema } from "../schema/profile.schema.js";
import { AuthService } from "../services/authService.js";
import type { AuthInterface } from "../types/user.js";

class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest<{ Body: AuthInterface }>, reply: FastifyReply) {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados de cadastro inválidos." });
    }

    const { name, email, password } = result.data;
    const user = await this.authService.register(name, email, password);

    return reply.status(201).send(user);
  }

  async login(request: FastifyRequest<{ Body: AuthInterface }>, reply: FastifyReply) {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados de login inválidos." });
    }

    const { email, password } = result.data;
    const user = await this.authService.login(email, password);
    const token = await reply.jwtSign({ sub: user.id, email: user.email });

    return reply
      .setCookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      })
      .status(200)
      .send({ message: "Login realizado com sucesso" });
  }
}

export { AuthController };
