import { PricingPlan, Subscription, PaymentRecord } from '../entities/PricingPlan';

export interface IPricingRepository {
    // Pricing Plans
    createPlan(plan: Partial<PricingPlan>): Promise<PricingPlan>;
    findPlanById(id: string): Promise<PricingPlan | null>;
    findAllPlans(activeOnly?: boolean): Promise<PricingPlan[]>;
    updatePlan(id: string, data: Partial<PricingPlan>): Promise<PricingPlan | null>;
    deletePlan(id: string): Promise<boolean>;

    // Subscriptions
    createSubscription(subscription: Partial<Subscription>): Promise<Subscription>;
    findSubscriptionById(id: string): Promise<Subscription | null>;
    findSubscriptionByTenantId(tenantId: string): Promise<Subscription | null>;
    findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
    updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null>;
    findExpiredSubscriptions(): Promise<Subscription[]>;
    findSubscriptionsEndingSoon(days: number): Promise<Subscription[]>;

    // Payment Records
    createPaymentRecord(payment: Partial<PaymentRecord>): Promise<PaymentRecord>;
    findPaymentsByTenantId(tenantId: string, page?: number, limit?: number): Promise<{ payments: PaymentRecord[]; total: number }>;
    findPaymentByStripeId(stripePaymentIntentId: string): Promise<PaymentRecord | null>;
    updatePaymentRecord(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord | null>;
}