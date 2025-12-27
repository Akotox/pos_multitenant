export interface PricingPlan {
    id?: string;
    name: string;
    description: string;
    price: number; // Monthly price in cents
    currency: string;
    billingInterval: BillingInterval;
    features: PlanFeature[];
    limits: PlanLimits;
    isActive: boolean;
    isPopular: boolean;
    stripePriceId?: string; // Stripe price ID for integration
    createdAt: Date;
    updatedAt: Date;
}

export enum BillingInterval {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'
}

export interface PlanFeature {
    name: string;
    description: string;
    included: boolean;
    limit?: number; // For features with limits
}

export interface PlanLimits {
    maxUsers: number;
    maxProducts: number;
    maxSalesPerMonth: number;
    maxStorageGB: number;
    apiCallsPerMonth: number;
    supportLevel: SupportLevel;
    customReports: boolean;
    multiLocation: boolean;
    advancedAnalytics: boolean;
    integrations: string[]; // List of available integrations
}

export enum SupportLevel {
    BASIC = 'BASIC',        // Email support
    STANDARD = 'STANDARD',  // Email + Chat support
    PREMIUM = 'PREMIUM',    // Email + Chat + Phone support
    ENTERPRISE = 'ENTERPRISE' // Dedicated support manager
}

// Subscription entity
export interface Subscription {
    id?: string;
    tenantId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    paymentMethodId?: string;
    trialEnd?: Date;
    usage: UsageMetrics;
    createdAt: Date;
    updatedAt: Date;
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    PAST_DUE = 'PAST_DUE',
    CANCELED = 'CANCELED',
    UNPAID = 'UNPAID',
    TRIALING = 'TRIALING',
    INCOMPLETE = 'INCOMPLETE',
    INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED'
}

export interface UsageMetrics {
    currentUsers: number;
    currentProducts: number;
    salesThisMonth: number;
    storageUsedGB: number;
    apiCallsThisMonth: number;
    lastUpdated: Date;
}

// Payment history
export interface PaymentRecord {
    id?: string;
    tenantId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    invoiceUrl?: string;
    failureReason?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum PaymentStatus {
    SUCCEEDED = 'SUCCEEDED',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    CANCELED = 'CANCELED',
    REFUNDED = 'REFUNDED'
}