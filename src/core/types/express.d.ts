import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                tenantId: string;
                role: string;
            };
            tenantId?: string;
        }
    }
}
