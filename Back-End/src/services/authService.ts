import bcrypt from 'bcrypt'
import { prisma } from "../lib/prisma.js"
import { serializeUser } from '../serializers/user.serializer.js'
import { ConflictError, UnauthorizedError } from "../errors/app-errors.js"

class AuthService {
    async register(name: string, email: string, password: string) {
        console.log(`Registering user with email: ${email}`)

        const hashedPassword = await bcrypt.hash(password, 10)

        let createUser

        try {
            createUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            })
        } catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
                throw new ConflictError("Este e-mail já está cadastrado")
            }

            throw error
        }

        return serializeUser(createUser);
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email: email },
        })

        if (!user) {
            throw new UnauthorizedError("E-mail ou senha inválidos")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new UnauthorizedError("E-mail ou senha inválidos")
        }

        return user
    }
}

export { AuthService }
