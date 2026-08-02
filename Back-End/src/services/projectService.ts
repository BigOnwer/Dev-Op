import { prisma } from "../lib/prisma.js"
import { Framework, Language, Level } from '../generated/prisma/enums.js';
import { AIService } from "../lib/ai.js";

class ProjectService {
    constructor(private aiService: AIService) {}
    
    async createProject(name: string, description: string, level: Level, framework: Framework, language: Language, userId: string) {
        if(!userId) {
            throw new Error("User not authenticated")
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
            throw new Error("User not authenticated")
        }

        console.log("1 - Buscando projeto")
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        
        if(!project) {
            throw new Error("project not existing")
        }

        if(project.userId !== userId) {
            throw new Error("User not authorized to access this project")
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
                throw new Error("Step not found")
            }


            if (step.projectId !== projectId) {
                throw new Error("Step does not belong to this project")
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
            throw new Error("User not authenticated")
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
            throw new Error("This step not exist")
        }

        if(step.project.userId !== userId) {
            throw new Error("User not authorized to access this step")
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
            throw new Error("User not authenticated")
        }

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId
            }
        })

        if(!project) {
            throw new Error("Project not existing")
        }

        if(project.userId !== userId) {
            throw new Error("User not authorized to access this project")
        }

        if(stepId) {
            const step = await prisma.roadmapStep.findUnique({
                where: {
                    id: stepId
                }
            })

            if(!step) {
                throw new Error("Step not existing")
            }

            if(step.projectId !== projectId) {
                throw new Error("Step does not belong to this project")
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
            throw new Error("User not authenticated")
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
            throw new Error("User not authorized to access this note")
        }

        if (!note) {
            throw new Error("Note not existing")
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
            throw new Error("User not authenticated")
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
            throw new Error("User not authorized to access this note")
        }

        if(project.project.userId !== userId) {
            throw new Error("User not authorized to access this note")
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
            throw new Error("User not authenticated")
        }

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        })

        if (!project) {
            throw new Error("Project not existing")
        }

        if(project.userId !== userId) {
            throw new Error("User not authorized to access this project")
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
            throw new Error("User not authenticated")
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
            throw new Error("User not authorized to access this step")
        }

        if (!step) {
            throw new Error("Step not existing")
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
            throw new Error("User not authenticated")
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

        if (project?.userId !== userId) {
            throw new Error(`User with ID ${userId} is not authorized to access project with ID ${projectId}`);
        }

        console.log({
            projectUserId: project?.userId,
            requestUserId: userId
        })

        if (!project) {
            throw new Error(`Project with ID ${projectId} not found`);
        }

        return project
    }
}

export { ProjectService }
