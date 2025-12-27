import { Request, Response, NextFunction } from 'express';
import { PricingUseCases } from '../../application/usecases/PricingUseCases';
import { PricingRepositoryImpl } from '../../infrastructure/repositories/PricingRepositoryImpl';
import { StripeService } from '../../infrastructure/services/StripeService';
import { ForbiddenError } from '../../../../core/errors/app-error';

interface SubscriptionRequest extends Request {
    tenantId?: string;
}

// Initialize dependencies
const pricingRepository = new PricingRepositoryImpl();
const stripeService = new StripeService();
const pricingUseCases = new PricingUseCases(pricingRepository, stripeService);

export const checkSubscriptionLimits = (limitType: 'users' | 'products' | 'sales' | 'storage' | 'api') => {
    return async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId;
            
            if (!tenantId) {
                return next(); // Skip check if no tenant context
            }

            // Get subscription and check limits
            const subscription = await pricingUseCases.getSubscriptionByTenantId(tenantId);
            
            if (!subscription) {
                // No subscription - allow basic functionality or redirect to pricing
                return next();
            }

            const limitsCheck = await pricingUseCases.checkUsageLimits(tenantId);
            
            if (!limitsCheck.withinLimits) {
                const relevantViolations = limitsCheck.violations.filter(violation => {
                    switch (limitType) {
                        case 'users':
                            return violation.includes('User limit');
                        case 'products':
                            return violation.includes('Product limit');
                        case 'sales':
                            return violation.includes('sales limit');
                        case 'storage':
                            return violation.includes('Storage limit');
                        case 'api':
                            return violation.includes('API calls limit');
                        default:
                            return true;
                    }
                });

                if (relevantViolations.length > 0) {
                    throw new ForbiddenError(`Subscription limit exceeded: ${relevantViolations[0]}. Please upgrade your plan.`);
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireActiveSubscription = async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.tenantId;
        
        if (!tenantId) {
            return next();
        }

        const subscription = await pricingUseCases.getSubscriptionByTenantId(tenantId);
        
        if (!subscription) {
            throw new ForbiddenError('Active subscription required. Please subscribe to a plan.');
        }

        if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
            throw new ForbiddenError('Your subscription is not active. Please update your payment method or contact support.');
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkFeatureAccess = (feature: 'multiLocation' | 'advancedAnalytics' | 'customReports' | 'apiAccess') => {
    return async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId;
            
            if (!tenantId) {
                return next();
            }

            const subscription = await pricingUseCases.getSubscriptionByTenantId(tenantId);
            
            if (!subscription) {
                throw new ForbiddenError('Subscription required to access this feature.');
            }

            // Get the plan details
            const plan = await pricingRepository.findPlanById(subscription.planId);
            
            if (!plan) {
                throw new ForbiddenError('Invalid subscription plan.');
            }

            // Check if feature is available in the plan
            let hasFeature = false;
            
            switch (feature) {
                case 'multiLocation':
                    hasFeature = plan.limits.multiLocation;
                    break;
                case 'advancedAnalytics':
                    hasFeature = plan.limits.advancedAnalytics;
                    break;
                case 'customReports':
                    hasFeature = plan.limits.customReports;
                    break;
                case 'apiAccess':
                    // API access is available if the plan has API calls allocated
                    hasFeature = plan.limits.apiCallsPerMonth > 0;
                    break;
                default:
                    hasFeature = false;
            }
            
            if (!hasFeature) {
                throw new ForbiddenError(`This feature is not available in your current plan. Please upgrade to access ${feature}.`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};