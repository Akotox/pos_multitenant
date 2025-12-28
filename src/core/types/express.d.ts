import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                tenantId: string;
                role: string;
            };
            admin?: {
                id: string;
                role: string;
                email: string;
            };
            tenantId?: string;
            userName?: string;
            userEmail?: string;
        }
    }
}
