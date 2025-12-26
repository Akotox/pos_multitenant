import { Request, Response, NextFunction } from 'express';
import { ProcessSubscriptionPaymentUseCase } from '../../../application/use-cases/ProcessSubscriptionPaymentUseCase';
import { ISubscriptionRepository } from '../../../domain/repositories/SubscriptionRepository';

export class PaymentsController {
    constructor(
        private processPaymentUseCase: ProcessSubscriptionPaymentUseCase,
        private subscriptionRepository: ISubscriptionRepository
    ) { }

    getSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.subscriptionRepository.findByTenantId(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    // Mock manual renewal / webhook
    renew = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { amount } = req.body;
            const subscription = await this.subscriptionRepository.findByTenantId(tenantId);

            if (!subscription) {
                return res.status(404).json({ message: 'Subscription not found' });
            }

            const result = await this.processPaymentUseCase.execute(
                tenantId,
                subscription._id.toString(),
                amount || 29.99,
                `MOCK_TX_${Date.now()}`
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
