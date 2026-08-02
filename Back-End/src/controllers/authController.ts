import type { FastifyReply, FastifyRequest } from "fastify"
import { AuthService } from "../services/authService.js"
import type { AuthInterface } from "../types/user.js";

class AuthController {
    constructor(private authService: AuthService) {}

    async register(request: FastifyRequest<{Body: AuthInterface}>, reply: FastifyReply) {
        try {
            const { name, email, password } = request.body

            if (!email || !password || !name) {
                return reply.status(400).send({ error: "All fields are required" })
            }

            const user = await this.authService.register(name, email, password )

            return reply.status(201).send(user)
        } catch (error) {
            console.error("Error in register:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }

    async login(request: FastifyRequest<{Body: AuthInterface}>, reply: FastifyReply) {
        try {
            const { email, password } = request.body
            if (!email || !password) {
                return reply.status(400).send({ error: "Email and password are required" })
            }

            const user = await this.authService.login(email, password)

            const token = await reply.jwtSign({
                sub: user.id,
                email: user.email
            })

            return reply
                .setCookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60,
                })
                .status(200)
                .send({
                    message: "Login realizado com sucesso"
                })
        } catch (error) {
            console.error("Error in login:", error)
            return reply.status(500).send({ error: "Internal Server Error" })
        }
    }
}

export { AuthController }