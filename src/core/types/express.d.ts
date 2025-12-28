import { Request } from 'express';
import { AdminPermission } from '../modules/admin/domain/entities/Admin';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                tenantId: string;
                role: string;
            };
            admin?: {
                adminId: string;
                email: string;
                role: string;
                permissions: AdminPermission[];
            };
            tenantId?: string;
            userName?: string;
            userEmail?: string;
        }
    }
}
