import { IPricingRepository } from '../../domain/repositories/IPricingRepository';
import { 
    PricingPlan, 
    Subscription, 
    PaymentRecord, 
    SubscriptionStatus, 
    PaymentStatus,
    UsageMetrics 
} from '../../domain/entities/PricingPlan';
import { StripeService } from '../../infrastructure/services/StripeService';
import { BadRequestError, NotFoundError } from '../../../../core/errors/app-error';
import { TenantModel } from '../../../auth/infrastructure/tenant.model';
import { UserModel } from '../../../auth/infrastructure/user.model';
import { ProductModel } from '../../../products/infrastructure/product.model';
import { SaleModel } from '../../../sales/infrastructure/sale.model';

export class PricingUseCases {
    constructor(
        private pricingRepository: IPricingRepository,
        private stripeService: StripeService
    ) {}

    // Pricing Plan Management
    async createPricingPlan(planData: Partial<PricingPlan>): Promise<PricingPlan> {
        // Create plan in database
        const plan = await this.pricingRepository.createPlan(planData);

        // Create product and price in Stripe
        try {
            const stripeProduct = await this.stripeService.createProduct(plan);
            const stripePrice = await this.stripeService.createPrice(stripeProduct.id, plan);
            
            // Update plan with Stripe price ID
            const updatedPlan = await this.pricingRepository.updatePlan(plan.id!, {
                stripePriceId: stripePrice.id
            });

            return updatedPlan!;
        } catch (error) {
            // If Stripe fails, delete the plan from database
            await this.pricingRepository.deletePlan(plan.id!);
            throw error;
        }
    }

    async getAllPricingPlans(activeOnly: boolean = true): Promise<PricingPlan[]> {
        return await this.pricingRepository.findAllPlans(activeOnly);
    }

    async getPricingPlanById(id: string): Promise<PricingPlan> {
        const plan = await this.pricingRepository.findPlanById(id);
        if (!plan) {
            throw new NotFoundError('Pricing plan not found');
        }
        return plan;
    }

    async updatePricingPlan(id: string, data: Partial<PricingPlan>): Promise<PricingPlan> {
        const plan = await this.pricingRepository.updatePlan(id, data);
        if (!plan) {
            throw new NotFoundError('Pricing plan not found');
        }

        // Update Stripe price if needed
        if (plan.stripePriceId && (data.price || data.currency)) {
            try {
                await this.stripeService.updatePrice(plan.stripePriceId, {
                    metadata: { planId: plan.id! }
                });
            } catch (error) {
                console.error('Failed to update Stripe price:', error);
            }
        }

        return plan;
    }

    async deletePricingPlan(id: string): Promise<void> {
        const plan = await this.pricingRepository.findPlanById(id);
        if (!plan) {
            throw new NotFoundError('Pricing plan not found');
        }

        // Check if any active subscriptions use this plan
        const activeSubscriptions = await this.pricingRepository.findAllPlans();
        // Implementation would check for active subscriptions

        const deleted = await this.pricingRepository.deletePlan(id);
        if (!deleted) {
            throw new NotFoundError('Pricing plan not found');
        }
    }

    // Subscription Management
    async createSubscription(
        tenantId: string, 
        planId: string, 
        paymentMethodId?: string,
        trialDays?: number
    ): Promise<{ subscription: Subscription; clientSecret?: string }> {
        // Get tenant and plan
        const [tenant, plan] = await Promise.all([
            TenantModel.findById(tenantId),
            this.pricingRepository.findPlanById(planId)
        ]);

        if (!tenant) throw new NotFoundError('Tenant not found');
        if (!plan) throw new NotFoundError('Pricing plan not found');

        // Check if tenant already has a subscription
        const existingSubscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (existingSubscription) {
            throw new BadRequestError('Tenant already has an active subscription');
        }

        // Create or get Stripe customer
        let stripeCustomer;
        try {
            stripeCustomer = await this.stripeService.createCustomer(
                tenantId,
                `tenant-${tenantId}@example.com`, // You might want to get actual email
                tenant.name
            );
        } catch (error) {
            throw new BadRequestError('Failed to create payment customer');
        }

        // Create Stripe subscription
        const stripeSubscription = await this.stripeService.createSubscription(
            stripeCustomer.id,
            plan.stripePriceId!,
            trialDays
        );

        // Calculate period dates
        const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        const trialEnd = stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined;

        // Create subscription in database
        const subscription = await this.pricingRepository.createSubscription({
            tenantId,
            planId,
            status: this.mapStripeStatusToLocal(stripeSubscription.status),
            currentPeriodStart,
            currentPeriodEnd,
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: stripeCustomer.id,
            paymentMethodId,
            trialEnd,
            usage: {
                currentUsers: 0,
                currentProducts: 0,
                salesThisMonth: 0,
                storageUsedGB: 0,
                apiCallsThisMonth: 0,
                lastUpdated: new Date()
            }
        });

        // Get client secret for payment confirmation if needed
        let clientSecret: string | undefined;
        if (stripeSubscription.latest_invoice && typeof stripeSubscription.latest_invoice === 'object') {
            const invoice = stripeSubscription.latest_invoice;
            if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
                clientSecret = invoice.payment_intent.client_secret || undefined;
            }
        }

        return { subscription, clientSecret };
    }

    async getSubscriptionByTenantId(tenantId: string): Promise<Subscription | null> {
        return await this.pricingRepository.findSubscriptionByTenantId(tenantId);
    }

    async updateSubscription(tenantId: string, planId: string): Promise<Subscription> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription) {
            throw new NotFoundError('Subscription not found');
        }

        const newPlan = await this.pricingRepository.findPlanById(planId);
        if (!newPlan) {
            throw new NotFoundError('Pricing plan not found');
        }

        // Update Stripe subscription
        if (subscription.stripeSubscriptionId) {
            const stripeSubscription = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);
            
            await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
                items: [{
                    id: stripeSubscription.items.data[0].id,
                    price: newPlan.stripePriceId
                }],
                proration_behavior: 'create_prorations'
            });
        }

        // Update local subscription
        const updatedSubscription = await this.pricingRepository.updateSubscription(subscription.id!, {
            planId: newPlan.id!
        });

        return updatedSubscription!;
    }

    async cancelSubscription(tenantId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription) {
            throw new NotFoundError('Subscription not found');
        }

        // Cancel Stripe subscription
        if (subscription.stripeSubscriptionId) {
            await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);
        }

        // Update local subscription
        const updatedSubscription = await this.pricingRepository.updateSubscription(subscription.id!, {
            cancelAtPeriodEnd,
            status: cancelAtPeriodEnd ? subscription.status : SubscriptionStatus.CANCELED
        });

        return updatedSubscription!;
    }

    async reactivateSubscription(tenantId: string): Promise<Subscription> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription) {
            throw new NotFoundError('Subscription not found');
        }

        // Reactivate Stripe subscription
        if (subscription.stripeSubscriptionId) {
            await this.stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
        }

        // Update local subscription
        const updatedSubscription = await this.pricingRepository.updateSubscription(subscription.id!, {
            cancelAtPeriodEnd: false,
            status: SubscriptionStatus.ACTIVE
        });

        return updatedSubscription!;
    }

    // Usage Tracking
    async updateUsageMetrics(tenantId: string): Promise<UsageMetrics> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription) {
            throw new NotFoundError('Subscription not found');
        }

        // Calculate current usage
        const [userCount, productCount, salesThisMonth] = await Promise.all([
            UserModel.countDocuments({ tenantId, isActive: true }),
            ProductModel.countDocuments({ tenantId, isActive: true }),
            this.getSalesCountThisMonth(tenantId)
        ]);

        const usage: UsageMetrics = {
            currentUsers: userCount,
            currentProducts: productCount,
            salesThisMonth,
            storageUsedGB: 0, // Calculate based on file uploads, etc.
            apiCallsThisMonth: 0, // Track API usage
            lastUpdated: new Date()
        };

        // Update subscription with new usage
        await this.pricingRepository.updateSubscription(subscription.id!, { usage });

        return usage;
    }

    async checkUsageLimits(tenantId: string): Promise<{ withinLimits: boolean; violations: string[] }> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription) {
            return { withinLimits: true, violations: [] };
        }

        const plan = await this.pricingRepository.findPlanById(subscription.planId);
        if (!plan) {
            return { withinLimits: true, violations: [] };
        }

        const usage = await this.updateUsageMetrics(tenantId);
        const violations: string[] = [];

        if (usage.currentUsers > plan.limits.maxUsers) {
            violations.push(`User limit exceeded: ${usage.currentUsers}/${plan.limits.maxUsers}`);
        }

        if (usage.currentProducts > plan.limits.maxProducts) {
            violations.push(`Product limit exceeded: ${usage.currentProducts}/${plan.limits.maxProducts}`);
        }

        if (usage.salesThisMonth > plan.limits.maxSalesPerMonth) {
            violations.push(`Monthly sales limit exceeded: ${usage.salesThisMonth}/${plan.limits.maxSalesPerMonth}`);
        }

        if (usage.storageUsedGB > plan.limits.maxStorageGB) {
            violations.push(`Storage limit exceeded: ${usage.storageUsedGB}GB/${plan.limits.maxStorageGB}GB`);
        }

        if (usage.apiCallsThisMonth > plan.limits.apiCallsPerMonth) {
            violations.push(`API calls limit exceeded: ${usage.apiCallsThisMonth}/${plan.limits.apiCallsPerMonth}`);
        }

        return {
            withinLimits: violations.length === 0,
            violations
        };
    }

    // Payment Management
    async getPaymentHistory(tenantId: string, page: number = 1, limit: number = 10) {
        return await this.pricingRepository.findPaymentsByTenantId(tenantId, page, limit);
    }

    async createBillingPortalSession(tenantId: string, returnUrl: string): Promise<string> {
        const subscription = await this.pricingRepository.findSubscriptionByTenantId(tenantId);
        if (!subscription || !subscription.stripeCustomerId) {
            throw new NotFoundError('No billing information found');
        }

        const session = await this.stripeService.createBillingPortalSession(
            subscription.stripeCustomerId,
            returnUrl
        );

        return session.url;
    }

    // Webhook handling
    async handleStripeWebhook(event: any): Promise<void> {
        switch (event.type) {
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }

    // Helper methods
    private async getSalesCountThisMonth(tenantId: string): Promise<number> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        return await SaleModel.countDocuments({
            tenantId,
            createdAt: { $gte: startOfMonth }
        });
    }

    private mapStripeStatusToLocal(stripeStatus: string): SubscriptionStatus {
        const statusMap: Record<string, SubscriptionStatus> = {
            'active': SubscriptionStatus.ACTIVE,
            'past_due': SubscriptionStatus.PAST_DUE,
            'canceled': SubscriptionStatus.CANCELED,
            'unpaid': SubscriptionStatus.UNPAID,
            'trialing': SubscriptionStatus.TRIALING,
            'incomplete': SubscriptionStatus.INCOMPLETE,
            'incomplete_expired': SubscriptionStatus.INCOMPLETE_EXPIRED
        };

        return statusMap[stripeStatus] || SubscriptionStatus.INCOMPLETE;
    }

    private async handleSubscriptionUpdated(stripeSubscription: any): Promise<void> {
        const subscription = await this.pricingRepository.findSubscriptionByStripeId(stripeSubscription.id);
        if (subscription) {
            await this.pricingRepository.updateSubscription(subscription.id!, {
                status: this.mapStripeStatusToLocal(stripeSubscription.status),
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
            });
        }
    }

    private async handleSubscriptionDeleted(stripeSubscription: any): Promise<void> {
        const subscription = await this.pricingRepository.findSubscriptionByStripeId(stripeSubscription.id);
        if (subscription) {
            await this.pricingRepository.updateSubscription(subscription.id!, {
                status: SubscriptionStatus.CANCELED
            });
        }
    }

    private async handlePaymentSucceeded(invoice: any): Promise<void> {
        if (invoice.subscription) {
            const subscription = await this.pricingRepository.findSubscriptionByStripeId(invoice.subscription);
            if (subscription) {
                await this.pricingRepository.createPaymentRecord({
                    tenantId: subscription.tenantId,
                    subscriptionId: subscription.id!,
                    amount: invoice.amount_paid,
                    currency: invoice.currency.toUpperCase(),
                    status: PaymentStatus.SUCCEEDED,
                    paymentMethod: 'stripe',
                    stripePaymentIntentId: invoice.payment_intent,
                    invoiceUrl: invoice.hosted_invoice_url,
                    paidAt: new Date(invoice.status_transitions.paid_at * 1000)
                });
            }
        }
    }

    private async handlePaymentFailed(invoice: any): Promise<void> {
        if (invoice.subscription) {
            const subscription = await this.pricingRepository.findSubscriptionByStripeId(invoice.subscription);
            if (subscription) {
                await this.pricingRepository.createPaymentRecord({
                    tenantId: subscription.tenantId,
                    subscriptionId: subscription.id!,
                    amount: invoice.amount_due,
                    currency: invoice.currency.toUpperCase(),
                    status: PaymentStatus.FAILED,
                    paymentMethod: 'stripe',
                    stripePaymentIntentId: invoice.payment_intent,
                    failureReason: 'Payment failed'
                });
            }
        }
    }
}