import { Request, Response, NextFunction } from 'express';
import { GetTenantUseCase } from '../application/get-tenant.usecase';

export class TenantController {
    constructor(private getTenantUseCase: GetTenantUseCase) { }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is requesting their own tenant data
            // req.tenantId is populated by auth middleware
            const tenantId = req.params.id || req.tenantId;

            if (!tenantId) {
                return res.status(400).json({ message: 'Tenant ID required' });
            }

            const tenant = await this.getTenantUseCase.execute(tenantId);
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    };
}
