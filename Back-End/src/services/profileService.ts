import { prisma } from "../lib/prisma.js"
import bcrypt from 'bcrypt'
import { UploadAvatar } from "../lib/uploadAvatar.js";
import { serializeUser } from "../serializers/user.serializer.js";
import { NotFoundError, UnauthorizedError } from "../errors/app-errors.js";

class ProfileService {
    async getUser(userId: string) {
        console.log(`Fetching user with ID: ${userId}`);
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            }
        })
        if (!user) {
            throw new NotFoundError("Usuário não encontrado")
        }
        return user
    }

    async updateUser(userId: string, name: string) {
         const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new NotFoundError("Usuário não encontrado")
        }

        const updateUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name
            }
        })

        return serializeUser(updateUser)
    }

    async updatePassword(userId: string, lastPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new NotFoundError("Usuário não encontrado")
        }

        if(!userId) {
            throw new UnauthorizedError()
        }

        const isMatch = await bcrypt.compare(lastPassword, user?.password)
        if(!isMatch) {
            throw new UnauthorizedError("Senha atual inválida")
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const updatePassword = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            }
        })

        return serializeUser(updatePassword)
    }

    async uploadAvatar(userId: string, buffer: Buffer, mimetype: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new NotFoundError("Usuário não encontrado")
        }

        if(!userId) {
            throw new UnauthorizedError()
        }

        const avatarUrl = await UploadAvatar(buffer, userId, mimetype);

        const updateAvatar = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                avatar: avatarUrl
            }
        })

        return serializeUser(updateAvatar)
    }
}

export { ProfileService }
