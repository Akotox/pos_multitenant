import { IPricingRepository } from '../../domain/repositories/IPricingRepository';
import { PricingPlan, Subscription, PaymentRecord } from '../../domain/entities/PricingPlan';
import { 
    PricingPlanModel, 
    PricingSubscriptionModel, 
    PaymentRecordModel 
} from '../models/pricing.models';

export class PricingRepositoryImpl implements IPricingRepository {
    // Pricing Plans
    async createPlan(plan: Partial<PricingPlan>): Promise<PricingPlan> {
        const newPlan = await PricingPlanModel.create(plan);
        return newPlan.toJSON();
    }

    async findPlanById(id: string): Promise<PricingPlan | null> {
        const plan = await PricingPlanModel.findById(id);
        return plan ? plan.toJSON() : null;
    }

    async findAllPlans(activeOnly: boolean = false): Promise<PricingPlan[]> {
        const query = activeOnly ? { isActive: true } : {};
        const plans = await PricingPlanModel.find(query).sort({ price: 1 });
        return plans.map(plan => plan.toJSON());
    }

    async updatePlan(id: string, data: Partial<PricingPlan>): Promise<PricingPlan | null> {
        const plan = await PricingPlanModel.findByIdAndUpdate(id, data, { new: true });
        return plan ? plan.toJSON() : null;
    }

    async deletePlan(id: string): Promise<boolean> {
        const result = await PricingPlanModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    // Subscriptions
    async createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
        const newSubscription = await PricingSubscriptionModel.create(subscription);
        return newSubscription.toJSON();
    }

    async findSubscriptionById(id: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findById(id).populate('planId');
        return subscription ? subscription.toJSON() : null;
    }

    async findSubscriptionByTenantId(tenantId: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findOne({ tenantId }).populate('planId');
        return subscription ? subscription.toJSON() : null;
    }

    async findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findOne({ stripeSubscriptionId }).populate('planId');
        return subscription ? subscription.toJSON() : null;
    }

    async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
        const subscription = await PricingSubscriptionModel.findByIdAndUpdate(id, data, { new: true }).populate('planId');
        return subscription ? subscription.toJSON() : null;
    }

    async findExpiredSubscriptions(): Promise<Subscription[]> {
        const now = new Date();
        const subscriptions = await PricingSubscriptionModel.find({
            currentPeriodEnd: { $lt: now },
            status: { $in: ['ACTIVE', 'PAST_DUE'] }
        }).populate('planId');
        
        return subscriptions.map(sub => sub.toJSON());
    }

    async findSubscriptionsEndingSoon(days: number): Promise<Subscription[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        const subscriptions = await PricingSubscriptionModel.find({
            currentPeriodEnd: { $lte: futureDate },
            status: 'ACTIVE',
            cancelAtPeriodEnd: false
        }).populate('planId');
        
        return subscriptions.map(sub => sub.toJSON());
    }

    // Payment Records
    async createPaymentRecord(payment: Partial<PaymentRecord>): Promise<PaymentRecord> {
        const newPayment = await PaymentRecordModel.create(payment);
        return newPayment.toJSON();
    }

    async findPaymentsByTenantId(tenantId: string, page: number = 1, limit: number = 10): Promise<{ payments: PaymentRecord[]; total: number }> {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            PaymentRecordModel.find({ tenantId })
                .populate('subscriptionId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            PaymentRecordModel.countDocuments({ tenantId })
        ]);

        return {
            payments: payments.map(payment => payment.toJSON()),
            total
        };
    }

    async findPaymentByStripeId(stripePaymentIntentId: string): Promise<PaymentRecord | null> {
        const payment = await PaymentRecordModel.findOne({ stripePaymentIntentId });
        return payment ? payment.toJSON() : null;
    }

    async updatePaymentRecord(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
        const payment = await PaymentRecordModel.findByIdAndUpdate(id, data, { new: true });
        return payment ? payment.toJSON() : null;
    }
}