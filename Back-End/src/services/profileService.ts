import { prisma } from "../lib/prisma.js"
import bcrypt from 'bcrypt'
import { UploadAvatar } from "../lib/uploadAvatar.js";

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
        return user;
    }

    async updateUser(userId: string, name: string) {
         const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new Error("User not found")
        }

        const updateUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name
            }
        })

        return updateUser
    }

    async updatePassword(userId: string, lastPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new Error("User not found")
        }

        if(!userId) {
            throw new Error("User ID is required")
        }

        const isMatch = await bcrypt.compare(lastPassword, user?.password)
        if(!isMatch) {
            throw new Error("As senhas nao sao iguais")
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

        return updatePassword
    }

    async uploadAvatar(userId: string, imagePatch: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            throw new Error("User not found")
        }

        if(!userId) {
            throw new Error("User ID is required")
        }

        const uploadAvatar = await UploadAvatar(imagePatch)
        if (!uploadAvatar) {
            throw new Error("Error uploading avatar")
        }

        const updateAvatar = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                avatar: uploadAvatar
            }
        })

        return updateAvatar
    }
}

export { ProfileService }
