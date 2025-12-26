import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class SecurityUtils {
    private static readonly SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    static generateToken(payload: any): string {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_super_secret_jwt_key',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
        );
    }
}
