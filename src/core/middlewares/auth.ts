import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { AdminPermission } from '../../modules/admin/domain/entities/Admin';

interface JwtPayload {
    id: string;
    tenantId: string;
    role: string;
}

interface AdminJwtPayload {
    adminId: string;
    email: string;
    role: string;
    permissions: AdminPermission[];
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

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Admin authentication token missing or invalid');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(
            token,
            process.env.ADMIN_JWT_SECRET || 'your_super_secret_admin_jwt_key'
        ) as AdminJwtPayload;

        // Check if user has admin role
        const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'BILLING_ADMIN', 'SUPPORT'];
        if (!adminRoles.includes(decoded.role)) {
            throw new ForbiddenError('Admin access required');
        }

        req.admin = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new UnauthorizedError('Invalid admin token'));
        }
        next(error);
    }
};
