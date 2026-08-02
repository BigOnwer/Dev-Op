import bcrypt from 'bcrypt'
import { prisma } from "../lib/prisma.js"
import { serializeUser } from '../serializers/user.serializer.js'

class AuthService {
    async register(name: string, email: string, password: string) {
        console.log(`Registering user with email: ${email}`)

        const hashedPassword = await bcrypt.hash(password, 10)

        const createUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return serializeUser(createUser);
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email: email },
        })

        if (!user) {
            throw new Error("User not found")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new Error("Invalid password")
        }

        return user
    }
}

export { AuthService }