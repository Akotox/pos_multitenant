import { PricingUseCases } from '../../application/usecases/PricingUseCases';
import { PricingRepositoryImpl } from '../repositories/PricingRepositoryImpl';
import { StripeService } from '../services/StripeService';

// Singleton instance for API usage tracking
class ApiUsageTracker {
    private pricingUseCases: PricingUseCases;

    constructor() {
        const pricingRepository = new PricingRepositoryImpl();
        const stripeService = new StripeService();
        this.pricingUseCases = new PricingUseCases(pricingRepository, stripeService);
    }

    /**
     * Track an API call for a tenant
     * @param tenantId - The tenant making the API call
     * @param endpoint - Optional endpoint name for detailed tracking
     */
    async trackApiCall(tenantId: string, endpoint?: string): Promise<void> {
        try {
            const subscription = await this.pricingUseCases.getSubscriptionByTenantId(tenantId);
            
            if (!subscription) {
                return; // No subscription, no tracking needed
            }

            // Update the API call count
            const currentUsage = subscription.usage;
            const updatedUsage = {
                ...currentUsage,
                apiCallsThisMonth: currentUsage.apiCallsThisMonth + 1,
                lastUpdated: new Date()
            };

            // Update the subscription with new usage
            await this.pricingUseCases.updateUsageMetrics(tenantId);

            // Log for monitoring (optional)
            if (process.env.NODE_ENV === 'development') {
                console.log(`API call tracked for tenant ${tenantId}${endpoint ? ` on ${endpoint}` : ''}: ${updatedUsage.apiCallsThisMonth} calls this month`);
            }
        } catch (error) {
            // Don't throw errors for usage tracking to avoid breaking API calls
            console.error('Error tracking API usage:', error);
        }
    }

    /**
     * Check if a tenant has exceeded their API limits
     * @param tenantId - The tenant to check
     * @returns Promise<boolean> - true if within limits, false if exceeded
     */
    async checkApiLimits(tenantId: string): Promise<boolean> {
        try {
            const limitsCheck = await this.pricingUseCases.checkUsageLimits(tenantId);
            
            // Check specifically for API limit violations
            const hasApiViolation = limitsCheck.violations.some(violation => 
                violation.includes('API calls limit')
            );
            
            return !hasApiViolation;
        } catch (error) {
            console.error('Error checking API limits:', error);
            return true; // Default to allowing the call if check fails
        }
    }

    /**
     * Get current API usage for a tenant
     * @param tenantId - The tenant to check
     * @returns Promise<{current: number, limit: number}> - Current usage and limit
     */
    async getApiUsage(tenantId: string): Promise<{ current: number; limit: number }> {
        try {
            const subscription = await this.pricingUseCases.getSubscriptionByTenantId(tenantId);
            
            if (!subscription) {
                return { current: 0, limit: 0 };
            }

            const plan = await this.pricingUseCases.getPricingPlanById(subscription.planId);
            
            return {
                current: subscription.usage.apiCallsThisMonth,
                limit: plan.limits.apiCallsPerMonth
            };
        } catch (error) {
            console.error('Error getting API usage:', error);
            return { current: 0, limit: 0 };
        }
    }
}

// Export singleton instance
export const apiUsageTracker = new ApiUsageTracker();

/**
 * Middleware to track API calls automatically
 * Add this to routes that should count towards API usage
 */
export const trackApiUsage = (endpoint?: string) => {
    return async (req: any, res: any, next: any) => {
        try {
            const tenantId = req.tenantId;
            
            if (tenantId) {
                // Track the API call asynchronously to not block the request
                setImmediate(() => {
                    apiUsageTracker.trackApiCall(tenantId, endpoint || req.route?.path);
                });
            }
            
            next();
        } catch (error) {
            // Don't block the request if tracking fails
            next();
        }
    };
};