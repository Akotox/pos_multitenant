import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';

interface JwtPayload {
    id: string;
    tenantId: string;
    role: string;
}

export const auth = (roles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('Authentication token missing or invalid');
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your_super_secret_jwt_key'
            ) as JwtPayload;

            req.user = decoded;
            req.tenantId = decoded.tenantId;

            if (roles.length && !roles.includes(decoded.role)) {
                throw new ForbiddenError('You do not have permission to perform this action');
            }

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return next(new UnauthorizedError('Invalid token'));
            }
            next(error);
        }
    };
};
