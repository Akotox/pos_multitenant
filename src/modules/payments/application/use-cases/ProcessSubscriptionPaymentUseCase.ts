import { ISubscriptionRepository } from '../../domain/repositories/SubscriptionRepository';
import { IPaymentRepository } from '../../domain/repositories/PaymentRepository';
import { SubscriptionStatus } from '../../domain/enums/SubscriptionStatus';
import { PaymentStatus } from '../../domain/enums/PaymentStatus';

export class ProcessSubscriptionPaymentUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private paymentRepository: IPaymentRepository
    ) { }

    async execute(tenantId: string, subscriptionId: string, amount: number, providerTransactionId: string) {
        // 1. Record/Update Payment
        await this.paymentRepository.create({
            tenantId: tenantId as any,
            subscriptionId: subscriptionId as any,
            amount,
            status: PaymentStatus.SUCCESS,
            provider: 'MOCK',
            providerTransactionId,
        });

        // 2. Update Subscription
        const currentSub = await this.subscriptionRepository.findByTenantId(tenantId);

        const newEndDate = new Date(currentSub ? currentSub.endDate : new Date());
        if (newEndDate < new Date()) {
            newEndDate.setTime(new Date().getTime());
        }
        newEndDate.setMonth(newEndDate.getMonth() + 1); // Add 1 month

        await this.subscriptionRepository.update(tenantId, {
            status: SubscriptionStatus.ACTIVE,
            endDate: newEndDate,
            gracePeriodEndsAt: undefined,
            isTrial: false,
        });

        return { message: 'Payment processed and subscription updated' };
    }
}
