import { ISubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { SubscriptionStatus } from '../../domain/enums/SubscriptionStatus';
import { ConflictError } from '../../../../core/errors/app-error';

export class StartTrialUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute(tenantId: string) {
        const existing = await this.subscriptionRepository.findByTenantId(tenantId);
        if (existing) {
            throw new ConflictError('Tenant already has a subscription or has used their trial');
        }

        const trialDurationDays = 14;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + trialDurationDays);

        return await this.subscriptionRepository.create({
            tenantId: tenantId as any,
            status: SubscriptionStatus.TRIAL,
            startDate: new Date(),
            endDate,
            isTrial: true,
        });
    }
}
