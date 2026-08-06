import type { FastifyReply, FastifyRequest } from "fastify";
import {
  completeStepSchema,
  createNoteSchema,
  createProjectSchema,
  idParamsSchema,
  projectChatSchema,
  stepIdParamsSchema,
  type CreateNoteInput,
  type ProjectChatInput,
} from "../schema/project.schema.js";
import type { ProjectService } from "../services/projectService.js";
import type { CompleteStepRequest, ProjectInterface } from "../types/project.js";

class ProjectController {
  constructor(private projectService: ProjectService) {}

  async createProject(request: FastifyRequest<{ Body: ProjectInterface }>, reply: FastifyReply) {
    const result = createProjectSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados do projeto inválidos." });
    }

    const { name, description, level, framework, language } = result.data;
    const project = await this.projectService.createProject(
      name,
      description,
      level,
      framework,
      language,
      request.user.sub,
    );

    return reply.status(201).send(project);
  }

  async detailsChat(request: FastifyRequest<{ Body: ProjectChatInput }>, reply: FastifyReply) {
    const result = projectChatSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados do chat inválidos." });
    }

    const { projectId, message, stepId } = result.data;
    const chat = await this.projectService.detailsChat(projectId, message, stepId ?? null, request.user.sub);

    return reply.status(200).send({
      message: "Resposta gerada com sucesso",
      data: chat,
    });
  }

  async completeStep(request: FastifyRequest<CompleteStepRequest>, reply: FastifyReply) {
    const params = stepIdParamsSchema.safeParse(request.params);
    const body = completeStepSchema.safeParse(request.body);

    if (!params.success || !body.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados da etapa inválidos." });
    }

    const updatedStep = await this.projectService.completeStep(
      body.data.state,
      params.data.stepId,
      request.user.sub,
    );

    return reply.status(200).send({
      message: "Passo atualizado com sucesso!",
      data: updatedStep,
    });
  }

  async createNote(request: FastifyRequest<{ Body: CreateNoteInput }>, reply: FastifyReply) {
    const result = createNoteSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "Dados da nota inválidos." });
    }

    const { projectId, note, stepId } = result.data;
    const createdNote = await this.projectService.createNote(projectId, note, request.user.sub, stepId);

    return reply.status(201).send({
      message: "Nota criada com sucesso",
      data: createdNote,
    });
  }

  async deleteNote(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const result = idParamsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "ID da nota inválido." });
    }

    await this.projectService.deleteNote(result.data.id, request.user.sub);
    return reply.status(200).send({ message: "Nota excluída com sucesso" });
  }

  async getNoteById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const result = idParamsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "ID da nota inválido." });
    }

    const note = await this.projectService.getNoteById(result.data.id, request.user.sub);
    return reply.status(200).send(note);
  }

  async getAllNotesByProjectId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const result = idParamsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "ID do projeto inválido." });
    }

    const notes = await this.projectService.getAllNotesByProjectId(result.data.id, request.user.sub);
    return reply.status(200).send(notes);
  }

  async getAllNotesByStepId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const result = idParamsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "ID da etapa inválido." });
    }

    const notes = await this.projectService.getAllNotesByStepId(result.data.id, request.user.sub);
    return reply.status(200).send(notes);
  }

  async getAllProjectsByUserId(request: FastifyRequest, reply: FastifyReply) {
    const projects = await this.projectService.getAllProjectsByUserId(request.user.sub);
    return reply.status(200).send(projects);
  }

  async getProjectById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const result = idParamsSchema.safeParse(request.params);
    if (!result.success) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", message: "ID do projeto inválido." });
    }

    const project = await this.projectService.getProjectById(result.data.id, request.user.sub);
    return reply.status(200).send(project);
  }
}

export { ProjectController };
