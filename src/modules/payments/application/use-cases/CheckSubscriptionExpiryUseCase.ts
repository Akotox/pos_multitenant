import { ISubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { SubscriptionStatus } from '../../domain/enums/SubscriptionStatus';

export class CheckSubscriptionExpiryUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute() {
        const now = new Date();

        // 1. Handle Active/Trial Expiry -> Grace Period or Expired
        const expired = await this.subscriptionRepository.findExpired(now);
        for (const sub of expired) {
            if (sub.isTrial) {
                await this.subscriptionRepository.update(sub.tenantId.toString(), {
                    status: SubscriptionStatus.EXPIRED,
                });
                console.log(`Trial expired for tenant ${sub.tenantId}`);
            } else {
                const gracePeriodDuration = 3; // 3 days grace period
                const gracePeriodEndsAt = new Date();
                gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + gracePeriodDuration);

                await this.subscriptionRepository.update(sub.tenantId.toString(), {
                    status: SubscriptionStatus.GRACE_PERIOD,
                    gracePeriodEndsAt,
                });
                console.log(`Subscription moved to grace period for tenant ${sub.tenantId}`);
            }
        }

        // 2. Handle Grace Period Expiry -> Suspended
        const graceExpired = await this.subscriptionRepository.findGracePeriodExpired(now);
        for (const sub of graceExpired) {
            await this.subscriptionRepository.update(sub.tenantId.toString(), {
                status: SubscriptionStatus.SUSPENDED,
            });
            console.log(`Grace period expired, tenant suspended: ${sub.tenantId}`);
        }
    }
}
