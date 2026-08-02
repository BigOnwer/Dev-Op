export interface ProjectInterface {
    id?: string
    name?: string
    description?: string
    status?: string
    level?: string
    framework?: string
    language?: string
    userId?: string
}

export interface RoadmapAIResponse {
    step: number

    title: string

    description: string

    technologies: string[]

    libraries: string[]

    designPatterns: string[]

    architectureConcepts: string[]

    folderStructure: {
        [key: string]: any
    }

    filesToCreate: string[]

    implementationGuide: string[]

    bestPractices: string[]

    commonMistakes: string[]

    studyTopics: string[]

    estimatedTime: string

    completionCriteria: string

    nextStep: string
}

export interface RoadmapStep {
    id?: string

    step?: number

    title?: string

    description?: string

    technologies?: string[]

    libraries?: string[]

    designPatterns?: string[]

    architectureConcepts?: string[]

    folderStructure?: {
        [key: string]: any
    }

    filesToCreate?: string[]

    implementationGuide?: string[]

    bestPractices?: string[]

    commonMistakes?: string[]

    studyTopics?: string[]

    estimatedTime?: string

    completionCriteria?: string[]

    nextStep?: string

    completed?: boolean

    projectId?: string

    createdAt?: Date

    updatedAt?: Date
}

export interface DetailsInterface {
    projectId: string
    message: string
    userId: string
    stepId?: string
}

export interface CompleteStepRequest {
  Params: {
    stepId: string;
  };
  Body: {
    state: boolean;
    userId: string
  };
}

export interface NoteInterface {
    id?: string
    content?: string
    projectId?: string
    stepId?: string
    createdAt?: Date
    updatedAt?: Date
}