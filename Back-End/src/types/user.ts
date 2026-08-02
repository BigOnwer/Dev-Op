import type { ProjectInterface } from "./project.js"

export interface AuthInterface {
    name?: string
    email?: string
    password?: string
}

export interface UserInterface {
    id?: string
    name?: string
    email?: string
    password?: string
    projects: ProjectInterface
}

export interface UpdatePassword{
    userId: string
    lastPassword: string
    newPassword: string
}