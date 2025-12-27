import { IPricingRepository } from '../../domain/repositories/IPricingRepository';
import { PricingPlan, Subscription, PaymentRecord, UsageMetrics } from '../../domain/entities/PricingPlan';
import { 
    PricingPlanModel, 
    PricingSubscriptionModel, 
    PaymentRecordModel,
    IPricingPlanDocument,
    ISubscriptionDocument,
    IPaymentRecordDocument
} from '../models/pricing.models';

export class PricingRepositoryImpl implements IPricingRepository {
    // Pricing Plan methods
    async createPlan(planData: Partial<PricingPlan>): Promise<PricingPlan> {
        const newPlan = new PricingPlanModel(planData);
        await newPlan.save();
        return newPlan.toJSON() as PricingPlan;
    }

    async findPlanById(id: string): Promise<PricingPlan | null> {
        const plan = await PricingPlanModel.findById(id).lean();
        return plan ? ({
            ...plan,
            id: plan._id.toString()
        } as PricingPlan) : null;
    }

    async findAllPlans(activeOnly: boolean = false): Promise<PricingPlan[]> {
        const query = activeOnly ? { isActive: true } : {};
        const plans = await PricingPlanModel.find(query).sort({ price: 1 }).lean();
        return plans.map(plan => ({
            ...plan,
            id: plan._id.toString()
        } as PricingPlan));
    }

    async updatePlan(id: string, updateData: Partial<PricingPlan>): Promise<PricingPlan | null> {
        const plan = await PricingPlanModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
        
        return plan ? ({
            ...plan,
            id: plan._id.toString()
        } as PricingPlan) : null;
    }

    async deletePlan(id: string): Promise<boolean> {
        const result = await PricingPlanModel.findByIdAndDelete(id);
        return !!result;
    }

    // Subscription methods
    async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
        const newSubscription = new PricingSubscriptionModel(subscriptionData);
        await newSubscription.save();
        return newSubscription.toJSON() as unknown as Subscription;
    }

    async findSubscriptionById(id: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findById(id).lean();
        return subscription ? ({
            ...subscription,
            id: subscription._id.toString(),
            tenantId: subscription.tenantId.toString(),
            planId: subscription.planId.toString()
        } as Subscription) : null;
    }

    async findSubscriptionByTenantId(tenantId: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findOne({ tenantId }).lean();
        return subscription ? ({
            ...subscription,
            id: subscription._id.toString(),
            tenantId: subscription.tenantId.toString(),
            planId: subscription.planId.toString()
        } as Subscription) : null;
    }

    async findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findOne({ stripeSubscriptionId }).lean();
        return subscription ? ({
            ...subscription,
            id: subscription._id.toString(),
            tenantId: subscription.tenantId.toString(),
            planId: subscription.planId.toString()
        } as Subscription) : null;
    }

    async updateSubscription(id: string, updateData: Partial<Subscription>): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
        
        return subscription ? ({
            ...subscription,
            id: subscription._id.toString(),
            tenantId: subscription.tenantId.toString(),
            planId: subscription.planId.toString()
        } as Subscription) : null;
    }

    async findExpiredSubscriptions(): Promise<Subscription[]> {
        const subscriptions = await PricingSubscriptionModel.find({ 
            status: { $in: ['PAST_DUE', 'UNPAID', 'CANCELLED'] } 
        }).lean();
        
        return subscriptions.map(sub => ({
            ...sub,
            id: sub._id.toString(),
            tenantId: sub.tenantId.toString(),
            planId: sub.planId.toString()
        } as Subscription));
    }

    async findSubscriptionsEndingSoon(days: number): Promise<Subscription[]> {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        
        const subscriptions = await PricingSubscriptionModel.find({
            status: 'ACTIVE',
            currentPeriodEnd: { $lte: targetDate }
        }).lean();
        
        return subscriptions.map(sub => ({
            ...sub,
            id: sub._id.toString(),
            tenantId: sub.tenantId.toString(),
            planId: sub.planId.toString()
        } as Subscription));
    }

    // Payment Record methods
    async createPaymentRecord(paymentData: Partial<PaymentRecord>): Promise<PaymentRecord> {
        const newPayment = new PaymentRecordModel(paymentData);
        await newPayment.save();
        return newPayment.toJSON() as unknown as PaymentRecord;
    }

    async findPaymentsByTenantId(tenantId: string, page: number = 1, limit: number = 10): Promise<{ payments: PaymentRecord[]; total: number }> {
        const skip = (page - 1) * limit;
        
        const [payments, total] = await Promise.all([
            PaymentRecordModel.find({ tenantId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PaymentRecordModel.countDocuments({ tenantId })
        ]);

        return {
            payments: payments.map(payment => ({
                ...payment,
                id: payment._id.toString(),
                tenantId: payment.tenantId.toString(),
                subscriptionId: payment.subscriptionId.toString()
            } as PaymentRecord)),
            total
        };
    }

    async findPaymentByStripeId(stripePaymentIntentId: string): Promise<PaymentRecord | null> {
        const payment = await PaymentRecordModel.findOne({ stripePaymentIntentId }).lean();
        return payment ? ({
            ...payment,
            id: payment._id.toString(),
            tenantId: payment.tenantId.toString(),
            subscriptionId: payment.subscriptionId.toString()
        } as PaymentRecord) : null;
    }

    async updatePaymentRecord(id: string, updateData: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
        const payment = await PaymentRecordModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
        
        return payment ? ({
            ...payment,
            id: payment._id.toString(),
            tenantId: payment.tenantId.toString(),
            subscriptionId: payment.subscriptionId.toString()
        } as PaymentRecord) : null;
    }

    // Usage tracking methods - removed since not in interface
}