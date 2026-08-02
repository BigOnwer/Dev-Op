import { type FastifyInstance } from "fastify";
import { ProfileService } from "../services/profileService.js";
import { ProfileController } from "../controllers/profileController.js";
import { authenticate } from "../middleware/auth.js";
import type { UpdatePassword, UserInterface } from "../types/user.js";

export function ProfileRoute(app: FastifyInstance) {
  const profileService = new ProfileService();
  const profileController = new ProfileController(profileService);

  app.get("/user", {
    preHandler: authenticate
  }, async (request, reply) => {
    return profileController.getUser(request, reply);
  });

  app.post<{Body: UserInterface}>("/update-user", {
    preHandler: authenticate
  }, async(request, reply) => {
    return profileController.updateUser(request, reply)
  })

  app.post<{Body: {imagePatch: string}}>("/upload-avatar", {
    preHandler: authenticate
  }, async(request, reply) => {
    return profileController.uploadAvatar(request, reply)
  })

  app.post<{Body: UpdatePassword}>("/update-password", {
    preHandler: authenticate
  }, async(request, reply) => {
    return profileController.updatePassword(request, reply)
  })
}