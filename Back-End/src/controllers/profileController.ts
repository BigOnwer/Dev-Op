import type { FastifyReply, FastifyRequest } from "fastify";
import { updateNameSchema, updatePasswordSchema } from "../schema/profile.schema.js";
import type { ProfileService } from "../services/profileService.js";
import type { UpdatePassword, UserInterface } from "../types/user.js";

class ProfileController {
  constructor(private profileService: ProfileService) {}

  async getUser(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.profileService.getUser(request.user.sub);
    return reply.status(200).send(user);
  }

  async updateUser(request: FastifyRequest<{ Body: UserInterface }>, reply: FastifyReply) {
    const result = updateNameSchema.safeParse({
      userId: request.user.sub,
      name: request.body.name,
    });

    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados de perfil inválidos." });
    }

    const user = await this.profileService.updateUser(result.data.userId, result.data.name);
    return reply.status(200).send(user);
  }

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const upload = await request.file();

    if (!upload) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Envie uma imagem." });
    }

    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedMimeTypes.has(upload.mimetype)) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Envie uma imagem PNG, JPG ou WEBP.",
      });
    }

    const buffer = await upload.toBuffer();
    if (upload.file.truncated) {
      return reply.status(413).send({ error: "FILE_TOO_LARGE", message: "A imagem excede o limite de 5 MB." });
    }

    const user = await this.profileService.uploadAvatar(request.user.sub, buffer, upload.mimetype);
    return reply.status(200).send(user);
  }

  async updatePassword(request: FastifyRequest<{ Body: UpdatePassword }>, reply: FastifyReply) {
    const result = updatePasswordSchema.safeParse({
      userId: request.user.sub,
      lastPassword: request.body.lastPassword,
      newPassword: request.body.newPassword,
    });

    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados de senha inválidos." });
    }

    const user = await this.profileService.updatePassword(
      result.data.userId,
      result.data.lastPassword,
      result.data.newPassword,
    );

    return reply.status(200).send(user);
  }
}

export { ProfileController };
