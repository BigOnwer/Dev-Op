import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/app-errors.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      request.log.info(
        { err: error, statusCode: error.statusCode },
        "Request rejected",
      );

      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    const fastifyError = error as { code?: string; validation?: unknown };

    if (fastifyError.code === "FST_REQ_FILE_TOO_LARGE") {
      return reply.status(413).send({
        error: "FILE_TOO_LARGE",
        message: "A imagem excede o limite permitido.",
      });
    }

    if (fastifyError.validation) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Dados inválidos.",
      });
    }

    request.log.error({ err: error }, "Unhandled request error");

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Ocorreu um erro interno. Tente novamente mais tarde.",
    });
  });
}
