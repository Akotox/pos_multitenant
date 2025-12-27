import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../../../../core/errors/app-error';
import { AdminPermission } from '../../domain/entities/Admin';

interface AdminRequest extends Request {
    admin?: {
        adminId: string;
        email: string;
        role: string;
        permissions: AdminPermission[];
    };
}

export const adminAuthMiddleware = (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new UnauthorizedError('Access token required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.admin = decoded;
        
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else {
            next(error);
        }
    }
};

export const requirePermission = (permission: AdminPermission) => {
    return (req: AdminRequest, res: Response, next: NextFunction) => {
        if (!req.admin) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!req.admin.permissions.includes(permission)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

export const requireAnyPermission = (permissions: AdminPermission[]) => {
    return (req: AdminRequest, res: Response, next: NextFunction) => {
        if (!req.admin) {
            return next(new UnauthorizedError('Authentication required'));
        }

        const hasPermission = permissions.some(permission => 
            req.admin!.permissions.includes(permission)
        );

        if (!hasPermission) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};