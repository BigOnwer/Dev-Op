import { prisma } from "../lib/prisma.js"
import { Framework, Language, Level } from '../generated/prisma/enums.js';
import { AIService } from "../lib/ai.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/app-errors.js";

class ProjectService {
    constructor(private aiService: AIService) {}
    
    async createProject(name: string, description: string, level: Level, framework: Framework, language: Language, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }
        console.log("1 - Criando projeto")
        const createProject = await prisma.project.create({
            data: {
                name: name,
                description: description,
                level: level as Level,
                framework: framework as Framework,
                language: language as Language,
                userId: userId
            }
        })

        console.log("2 - Projeto criado")
        const roadmap = await this.aiService.generateRoadmap(createProject);
        console.log("3 - IA respondeu:")

        const roadmapSteps = JSON.parse(roadmap);
        console.log("4 - JSON convertido")

       const createRoadmapSteps = await prisma.roadmapStep.createMany({
            data: roadmapSteps.map((step: any) => ({
                step: step.step,
                title: step.title,
                description: step.description,

                technologies: step.technologies,
                libraries: step.libraries,
                designPatterns: step.designPatterns,
                architectureConcepts: step.architectureConcepts,

                folderStructure: step.folderStructure,

                filesToCreate: step.filesToCreate,

                implementationGuide: step.implementationGuide,

                bestPractices: step.bestPractices,

                commonMistakes: step.commonMistakes,

                studyTopics: step.studyTopics,

                estimatedTime: step.estimatedTime,

                completionCriteria: step.completionCriteria,

                nextStep: step.nextStep,

                completed: false,

                projectId: createProject.id
            }))
        })
        console.log("5 - Roadmap salvo")

        return { project: createProject, createdRoadmapSteps: createRoadmapSteps.count};
    }

    async detailsChat(projectId: string, message: string, stepId: string | null, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        console.log("1 - Buscando projeto")
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        
        if(!project) {
            throw new NotFoundError("Projeto não encontrado")
        }

        if(project.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar este projeto")
        }
         console.log("2 - Projeto encontrado")

        let context: object = {
            type: "project",
            project 
        }

        if(stepId) {
            console.log("3 - Buscando step")
            const step = await prisma.roadmapStep.findUnique({
                where: {
                    id: stepId
                }
            })

            if (!step) {
                throw new NotFoundError("Etapa não encontrada")
            }


            if (step.projectId !== projectId) {
                throw new ForbiddenError("Esta etapa não pertence ao projeto")
            }

            context = {
                type: "step",
                project,
                step
            }
            console.log("4 - Step encontrado")
        }

        console.log("5 - Enviando para IA")

        const iaGenerateDetails = await this.aiService.generateDetailsChat(
            message,
            context
        )

        console.log("6 - IA respondeu")

        return iaGenerateDetails
    }

    async completeStep(state: boolean, stepId: string, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }
        const step = await prisma.roadmapStep.findUnique({
            where: {
                id: stepId
            },
            select:{
                completed: true,
                project: {
                    select: {
                        userId: true
                    }
                }
            }
        })

        if(!step) {
            throw new NotFoundError("Etapa não encontrada")
        }

        if(step.project.userId !== userId) {
            throw new ForbiddenError("Você não pode alterar esta etapa")
        }

        const newState = !state

        const completeStep = await prisma.roadmapStep.updateMany({
            where: {
                id: stepId
            },
            data: {
                completed: newState
            }
        })

        return completeStep
    }

    async createNote(projectId: string, note: string, userId: string, stepId?: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId
            }
        })

        if(!project) {
            throw new NotFoundError("Projeto não encontrado")
        }

        if(project.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar este projeto")
        }

        if(stepId) {
            const step = await prisma.roadmapStep.findUnique({
                where: {
                    id: stepId
                }
            })

            if(!step) {
                throw new NotFoundError("Etapa não encontrada")
            }

            if(step.projectId !== projectId) {
                throw new ForbiddenError("Esta etapa não pertence ao projeto")
            }
        }

        return prisma.note.create({
            data: {
                content: note,
                projectId,
                ...(stepId ? { stepId } : {})
            }
        })
    }

    async deleteNote(noteId: string, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const note = await prisma.note.findUnique({
            where: {
                id: noteId,
                project: {
                    userId
                }
            }
        })

        const project = await prisma.note.findUnique({
            where: {
                id: noteId,
                project: {
                    userId
                }
            },
            select: {
                project: {
                    select: {
                        userId: true
                    }
                }
            }
        })

        if(project?.project?.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar esta nota")
        }

        if (!note) {
            throw new NotFoundError("Nota não encontrada")
        }
        
        const deleteNote = await prisma.note.deleteMany({
            where: {
                id: noteId
            }
        })

        return deleteNote
    }

    async getNoteById(noteId: string, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const project = await prisma.note.findUnique({
            where: {
                id: noteId,
                project: {
                    userId
                }
            },
            select: {
                project: {
                    select: {
                        userId: true
                    }
                }
            }
        })

        if(project?.project?.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar esta nota")
        }

        if(project.project.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar esta nota")
        }

        const note = await prisma.note.findUnique({
            where: {
                id: noteId
            }
        })

        return note;
    }

    async getAllNotesByProjectId(projectId: string, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        })

        if (!project) {
            throw new NotFoundError("Projeto não encontrado")
        }

        if(project.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar este projeto")
        }

        const notes = await prisma.note.findMany({
            where: {
                projectId: projectId
            },
            orderBy: { createdAt: "desc" }
        })
        return notes;
    }

    async getAllNotesByStepId(stepId: string, userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const step = await prisma.roadmapStep.findFirst({
            where: {
                id: stepId,
                project: { userId }
            }
        })

        const project = await prisma.roadmapStep.findUnique({
            where: {
                id: stepId
            },
            select: {
                project: {
                    select: {
                        userId: true
                    }
                }
            }
        })

        if(project?.project?.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar esta etapa")
        }

        if (!step) {
            throw new NotFoundError("Etapa não encontrada")
        }

        const notes = await prisma.note.findMany({
            where: {
                stepId: stepId
            },
            orderBy: { createdAt: "desc" }
        })
        return notes;
    }

    async getAllProjectsByUserId(userId: string) {
        if(!userId) {
            throw new UnauthorizedError()
        }

        const projects = await prisma.project.findMany({
            where: {
                userId: userId
            },
            include: {
                RoadmapSteps: false,
            }
        })
        return projects;
    }

    async getProjectById(projectId: string, userId: string) {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                RoadmapSteps: true
            }
        })

        if (!project) {
            throw new NotFoundError("Projeto não encontrado")
        }

        if (project.userId !== userId) {
            throw new ForbiddenError("Você não pode acessar este projeto")
        }

        return project
    }
}

export { ProjectService }
