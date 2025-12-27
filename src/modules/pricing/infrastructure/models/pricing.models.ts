import { Schema, model, Document, Types } from 'mongoose';
import { 
    PricingPlan, 
    BillingInterval, 
    SupportLevel, 
    Subscription, 
    SubscriptionStatus, 
    PaymentRecord, 
    PaymentStatus 
} from '../../domain/entities/PricingPlan';

// Pricing Plan Model
export interface IPricingPlanDocument extends PricingPlan, Document {}

const planFeatureSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    included: { type: Boolean, required: true },
    limit: { type: Number }
}, { _id: false });

const planLimitsSchema = new Schema({
    maxUsers: { type: Number, required: true },
    maxProducts: { type: Number, required: true },
    maxSalesPerMonth: { type: Number, required: true },
    maxStorageGB: { type: Number, required: true },
    apiCallsPerMonth: { type: Number, required: true },
    supportLevel: {
        type: String,
        enum: Object.values(SupportLevel),
        required: true
    },
    customReports: { type: Boolean, default: false },
    multiLocation: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    integrations: [{ type: String }]
}, { _id: false });

const pricingPlanSchema = new Schema<IPricingPlanDocument>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }, // Price in cents
        currency: { type: String, required: true, default: 'USD' },
        billingInterval: {
            type: String,
            enum: Object.values(BillingInterval),
            required: true
        },
        features: [planFeatureSchema],
        limits: { type: planLimitsSchema, required: true },
        isActive: { type: Boolean, default: true },
        isPopular: { type: Boolean, default: false },
        stripePriceId: { type: String }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

pricingPlanSchema.index({ name: 1 }, { unique: true });
pricingPlanSchema.index({ isActive: 1 });
pricingPlanSchema.index({ price: 1 });

export const PricingPlanModel = model<IPricingPlanDocument>('PricingPlan', pricingPlanSchema);

// Subscription Model
export interface ISubscriptionDocument extends Omit<Subscription, 'tenantId' | 'planId'>, Document {
    tenantId: Types.ObjectId;
    planId: Types.ObjectId;
}

const usageMetricsSchema = new Schema({
    currentUsers: { type: Number, default: 0 },
    currentProducts: { type: Number, default: 0 },
    salesThisMonth: { type: Number, default: 0 },
    storageUsedGB: { type: Number, default: 0 },
    apiCallsThisMonth: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const subscriptionSchema = new Schema<ISubscriptionDocument>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        planId: { type: Schema.Types.ObjectId, ref: 'PricingPlan', required: true },
        status: {
            type: String,
            enum: Object.values(SubscriptionStatus),
            required: true
        },
        currentPeriodStart: { type: Date, required: true },
        currentPeriodEnd: { type: Date, required: true },
        cancelAtPeriodEnd: { type: Boolean, default: false },
        stripeSubscriptionId: { type: String },
        stripeCustomerId: { type: String },
        paymentMethodId: { type: String },
        trialEnd: { type: Date },
        usage: { type: usageMetricsSchema, default: {} }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Indexes
subscriptionSchema.index({ tenantId: 1 }, { unique: true });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true, sparse: true });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

export const PricingSubscriptionModel = model<ISubscriptionDocument>('PricingSubscription', subscriptionSchema);

// Payment Record Model
export interface IPaymentRecordDocument extends Omit<PaymentRecord, 'tenantId' | 'subscriptionId'>, Document {
    tenantId: Types.ObjectId;
    subscriptionId: Types.ObjectId;
}

const paymentRecordSchema = new Schema<IPaymentRecordDocument>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
        subscriptionId: { type: Schema.Types.ObjectId, ref: 'PricingSubscription', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true, default: 'USD' },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            required: true
        },
        paymentMethod: { type: String, required: true },
        stripePaymentIntentId: { type: String },
        invoiceUrl: { type: String },
        failureReason: { type: String },
        paidAt: { type: Date }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Indexes
paymentRecordSchema.index({ tenantId: 1 });
paymentRecordSchema.index({ subscriptionId: 1 });
paymentRecordSchema.index({ stripePaymentIntentId: 1 }, { unique: true, sparse: true });
paymentRecordSchema.index({ status: 1 });
paymentRecordSchema.index({ createdAt: -1 });

export const PaymentRecordModel = model<IPaymentRecordDocument>('PaymentRecord', paymentRecordSchema);