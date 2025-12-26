import { ISubscriptionRepository } from '../../../domain/repositories/SubscriptionRepository';
import { ISubscription, SubscriptionModel } from '../models/SubscriptionModel';
import { SubscriptionStatus } from '../../../domain/enums/SubscriptionStatus';

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {
    async create(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
        return await SubscriptionModel.create(subscriptionData);
    }

    async findByTenantId(tenantId: string): Promise<ISubscription | null> {
        return await SubscriptionModel.findOne({ tenantId });
    }

    async update(tenantId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
        return await SubscriptionModel.findOneAndUpdate(
            { tenantId },
            { $set: updateData },
            { new: true }
        );
    }

    async findExpired(now: Date): Promise<ISubscription[]> {
        return await SubscriptionModel.find({
            endDate: { $lt: now },
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        });
    }

    async findGracePeriodExpired(now: Date): Promise<ISubscription[]> {
        return await SubscriptionModel.find({
            gracePeriodEndsAt: { $lt: now },
            status: SubscriptionStatus.GRACE_PERIOD,
        });
    }
}
