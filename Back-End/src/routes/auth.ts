import { type FastifyInstance } from "fastify";
import { AuthController } from "../controllers/authController.js";
import { AuthService } from "../services/authService.js";
import type { AuthInterface } from "../types/user.js";
import { withRateLimit } from "../plugins/security.js";

export function AuthRoute(app: FastifyInstance) {
  const authService = new AuthService();
  const authController = new AuthController(authService);

  app.post<{Body: AuthInterface}>("/register", withRateLimit("register"), async (request, reply) => {
    return authController.register(request, reply);
  });

  app.post<{Body: AuthInterface}>("/login", withRateLimit("login"), async (request, reply) => {
    return authController.login(request, reply);
  });
}