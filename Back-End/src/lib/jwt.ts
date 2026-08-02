import jwt from 'jsonwebtoken';
import type { AuthInterface } from "../types/user.js";

export async function generateToken(userPayload: AuthInterface, secretKey: string): Promise<string> {
    const expiresIn = '1h'; // Token expiration time
    const jsonwebtoken = jwt.sign(userPayload, secretKey, { expiresIn });
    return jsonwebtoken;
}

export async function verifyToken(token: string, secretKey: string): Promise<AuthInterface | null> {
    try {
        const decoded = jwt.verify(token, secretKey) as AuthInterface;
        return decoded;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}