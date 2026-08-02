import type { FastifyReply, FastifyRequest } from "fastify"
import type { CompleteStepRequest, ProjectInterface, DetailsInterface } from "../types/project.js";
import type { ProjectService } from "../services/projectService.js";
import { completeStepSchema, createNoteSchema, createProjectSchema, idParamsSchema, projectChatSchema, stepIdParamsSchema, type CreateNoteInput, type ProjectChatInput,  } from "../schema/project.schema.js";

class ProjectController {
    constructor(private projectService: ProjectService) {}

    async createProject(request: FastifyRequest<{Body: ProjectInterface}>, reply: FastifyReply) {
        try {
            const result = createProjectSchema.safeParse(request.body)
            const userId = request.user?.sub

            if (!result.success) {
                return reply.status(400).send({ error: "Invalid project data" })
            }

            const { name, description, level, framework, language } = result.data

            const project = await this.projectService.createProject(name, description, level, framework, language, userId)

            return reply.status(201).send(project)
        } catch (error) {
            console.error("Error in createProject:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async detailsChat(request: FastifyRequest<{Body: ProjectChatInput}>, reply: FastifyReply) {
        const result = projectChatSchema.safeParse(request.body)
        const userId = request.user?.sub

        if(!result.success) {
            return reply.status(400).send({ error: "Invalid project chat data" })
        }

        const { projectId, message, stepId } = result.data

        const chat = await this.projectService.detailsChat(projectId, message, stepId || null, userId)

        return reply.status(200).send({
            message: "resposta gerada com sucesso",
            data: chat
        })
    }

    async completeStep(
        request: FastifyRequest<CompleteStepRequest>, 
        reply: FastifyReply
    ) {
        try{
            const params = stepIdParamsSchema.safeParse(request.params);
            const result = completeStepSchema.safeParse(request.body);
            const userId = request.user?.sub;

            if(!result.success) {
                return reply.status(400).send({error: 'Invalid step data'})
            }

            if(!params.success) {
                return reply.status(400).send({error: 'Invalid step ID'})
            }

            const { state } = result.data;
            const { stepId } = params.data;

            const updatedStep = await this.projectService.completeStep(state, stepId, userId);
            return reply.status(200).send({
                message: "Passo atualizado com sucesso!",
                data: updatedStep
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "This step not exist") {
                return reply.status(404).send({ error: error.message });
                }
                return reply.status(400).send({ error: error.message });
            }

            return reply.status(500).send({ error: "Erro interno do servidor." });
        }
    }

    async createNote(request: FastifyRequest<{Body: CreateNoteInput}>, reply: FastifyReply) {
        try {
            const result = createNoteSchema.safeParse(request.body)
            if (!result.success) {
                return reply.status(400).send({ error: "Invalid note data" })
            }

            const { projectId, note, stepId } = result.data
            const userId = request.user?.sub
            const createdNote = await this.projectService.createNote(projectId, note, userId, stepId)

            return reply.status(201).send({
                message: "Note created successfully",
                data: createdNote
            })
        } catch (error) {
            console.log("Error in createNote:", error)
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    }

    async deleteNote(request: FastifyRequest<{Params: {id: string, userId: string}}>, reply: FastifyReply) {
        try {
            const response = idParamsSchema.safeParse(request.params)
            const userId = request.user?.sub

            if(!response.success) {
                return reply.status(400).send({ error: "Note ID is required" })
            }

            const noteId = response.data.id

            await this.projectService.deleteNote(noteId, userId)

            return reply.status(200).send({ message: "Note deleted successfully" })
        } catch (error) {
            console.error("Error in deleteNote:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async getNoteById(request: FastifyRequest<{Params: {id: string, userId: string}}>, reply: FastifyReply) {
        try {
            const userId = request.user?.sub
            if(!userId) {
                return reply.status(400).send({ error: "User ID is required" })
            }

            const response = idParamsSchema.safeParse(request.params)

            if(!response.success) {
                return reply.status(400).send({ error: "Note ID is required" })
            }

            const noteId = response.data.id

            const note = await this.projectService.getNoteById(noteId, userId)

            return reply.status(200).send(note)
        } catch (error) {
            console.error("Error in getNoteById:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async getAllNotesByProjectId(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try {
            const response = idParamsSchema.safeParse(request.params)
            if(!response.success) {
                return reply.status(400).send({ error: "Project ID is required" })
            }

            const projectId = response.data.id
            const notes = await this.projectService.getAllNotesByProjectId(projectId, request.user?.sub)
            return reply.status(200).send(notes)
        } catch (error) {
            console.error("Error in getAllNotesByProjectId:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async getAllNotesByStepId(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try {
            const response = idParamsSchema.safeParse(request.params)
            if(!response.success) {
                return reply.status(400).send({ error: "Step ID is required" })
            }

            const stepId = response.data.id
            const notes = await this.projectService.getAllNotesByStepId(stepId, request.user?.sub)
            return reply.status(200).send(notes)
        } catch (error) {
            console.error("Error in getAllNotesByStepId:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    

    async getAllProjectsByUserId(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user?.sub
            const projects = await this.projectService.getAllProjectsByUserId(userId)
            return reply.status(200).send(projects)
        } catch (error) {
            console.error("Error in getAllProjectsByUserId:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async getProjectById(request: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try {
            const userId = request.user?.sub
            const response = idParamsSchema.safeParse(request.params)
            if(!response.success) {
                return reply.status(400).send({ error: "Project ID is required" })
            }
            const projectId = response.data.id
            const project = await this.projectService.getProjectById(projectId, userId)
            return reply.status(200).send(project)
        } catch (error) {
            console.error("Error in getProjectById:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }
}

export { ProjectController }
