import { Request, Response, NextFunction } from 'express';
import { SubscriptionRepositoryImpl } from '../../../infrastructure/database/repositories/SubscriptionRepositoryImpl';
import { SubscriptionStatus } from '../../../domain/enums/SubscriptionStatus';
import { ForbiddenError } from '../../../../../core/errors/app-error';

const subscriptionRepository = new SubscriptionRepositoryImpl();

export const subscriptionGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.tenantId;

        if (!tenantId) {
            return next(); // Should be caught by auth middleware, but safety first
        }

        const subscription = await subscriptionRepository.findByTenantId(tenantId);

        const allowedStatuses = [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIAL,
            SubscriptionStatus.GRACE_PERIOD,
        ];

        if (!subscription || !allowedStatuses.includes(subscription.status)) {
            throw new ForbiddenError(
                'Subscription Required. Your access has been suspended due to an expired subscription or failed payment.'
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
