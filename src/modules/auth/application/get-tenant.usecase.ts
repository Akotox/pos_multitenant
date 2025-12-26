import { IAuthRepository } from '../domain/auth.repository';
import { ITenant } from '../infrastructure/tenant.model';
import { NotFoundError } from '../../../core/errors/app-error';

export class GetTenantUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(tenantId: string): Promise<ITenant> {
        const tenant = await this.authRepository.findTenantById(tenantId);
        if (!tenant) {
            throw new NotFoundError(`Tenant with id ${tenantId} not found`);
        }
        return tenant;
    }
}
