import { type FastifyInstance } from "fastify";
import { type ProjectInterface, type CompleteStepRequest, type DetailsInterface } from "../types/project.js";
import { ProjectController } from "../controllers/projectController.js";
import { ProjectService } from "../services/projectService.js";
import { authenticate } from "../middleware/auth.js";
import { AIService } from "../lib/ai.js";
import { withRateLimit } from "../plugins/security.js";

export function ProjectRoute(app: FastifyInstance) {
  const aiService = new AIService()

  const projectService = new ProjectService(aiService)

  const projectController = new ProjectController(projectService)

  app.post<{Body: ProjectInterface}>("/projects",{
    ...withRateLimit("createProject"),
        preHandler: authenticate
    }, async (request, reply) => {
    return projectController.createProject(request, reply);
  })

  app.post<{Body: DetailsInterface}>("/projects/chat", {
    ...withRateLimit("chatWithAi"),
    preHandler: authenticate
  }, async(request, reply) => {
    return projectController.detailsChat(request, reply)
  })
  
  app.post<{Body: {projectId: string, note: string, stepId?: string}}>("/projects/note", {
    preHandler: authenticate
  }, async(request, reply) => {
    return projectController.createNote(request, reply)
  })

  app.delete<{Params: {id: string, userId: string}}>("/projects/note/:id", {
    preHandler: authenticate
  }, async(request, reply) => {
    return projectController.deleteNote(request, reply)
  })

  app.get<{Params: {id: string}}>("/projects/:id/notes", {
    preHandler: authenticate
  }, async(request, reply) => {
    return projectController.getAllNotesByProjectId(request, reply)
  })

  app.get<{Params: {id: string}}>("/projects/steps/:id/notes", {
    preHandler: authenticate
  }, async(request, reply) => {
    return projectController.getAllNotesByStepId(request, reply)
  })

  app.patch<CompleteStepRequest>("/projects/:stepId",{
        preHandler: authenticate
    }, async (request, reply) => {
        return projectController.completeStep(request, reply)
    })

  app.get("/projects", {
        preHandler: authenticate
    }, async (request, reply) => {
    return projectController.getAllProjectsByUserId(request, reply);
  })

  app.get<{Params: {id: string}}>("/projects/:id", {
        preHandler: authenticate
    }, async (request, reply) => {
    return projectController.getProjectById(request, reply);
  })
}
