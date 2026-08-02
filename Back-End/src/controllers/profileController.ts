import type { FastifyReply, FastifyRequest } from "fastify"
import type { ProfileService } from "../services/profileService.js";
import type { UpdatePassword, UserInterface } from "../types/user.js";
class ProfileController {
    constructor(private profileService: ProfileService) {}

    async getUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user?.sub
            const user = await this.profileService.getUser(userId)
            return reply.status(200).send(user)
        } catch (error) {
            console.error("Error in getUser:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async updateUser(request: FastifyRequest<{Body: UserInterface}>, reply: FastifyReply) {
        try{
            const {name} = request.body
            const userId = request.user.sub
            if(!userId) {
                return reply.status(400).send({error: "Você deve estar logado"})
            }
            if(!name){
                return reply.status(400).send({error: "All fields are required"})
            }

            const updateUser = await this.profileService.updateUser(userId, name)
            return reply.status(200).send(updateUser)
        } catch (error){
            console.log("error in Update User", error)
            return reply.status(500).send({error: "Internal Server Rrror"})
        }
    }

    async uploadAvatar(request: FastifyRequest<{Body: {imagePatch: string}}>, reply: FastifyReply) {
        try{
            const {imagePatch} = request.body
            const userId = request.user.sub
            if(!userId) {
                return reply.status(400).send({error: "Você deve estar logado"})
            }
            if(!imagePatch){
                return reply.status(400).send({error: "All fields are required"})
            }

            const uploadAvatar = await this.profileService.uploadAvatar(userId, imagePatch)
            
            return reply.status(200).send(uploadAvatar)
        } catch (error){
            console.log("error in Upload Avatar", error)
            return reply.status(500).send({error: "Internal Server Rrror"})
        }
    }

    async updatePassword(request: FastifyRequest<{Body: UpdatePassword}>, reply: FastifyReply) {
        try{
            const {lastPassword, newPassword} = request.body
            const userId = request.user.sub
            if(!userId) {
                return reply.status(400).send({error: "Você deve estar logado"})
            }
            if(!lastPassword || !newPassword){
                return reply.status(400).send({error: "All fields are required"})
            }

            const updatePassword = await this.profileService.updatePassword(userId, lastPassword, newPassword)
            return reply.status(200).send(updatePassword)
        } catch (error){
            console.log("error in Update Password", error)
            return reply.status(500).send({error: "Internal Server Rrror"})
        }
    }
}

export { ProfileController }