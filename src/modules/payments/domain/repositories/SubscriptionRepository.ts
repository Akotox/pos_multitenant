import { ISubscription } from '../../infrastructure/database/models/SubscriptionModel';

export interface ISubscriptionRepository {
    create(subscriptionData: Partial<ISubscription>): Promise<ISubscription>;
    findByTenantId(tenantId: string): Promise<ISubscription | null>;
    update(tenantId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null>;
    findExpired(now: Date): Promise<ISubscription[]>;
    findGracePeriodExpired(now: Date): Promise<ISubscription[]>;
}
