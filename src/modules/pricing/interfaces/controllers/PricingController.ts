import { Request, Response, NextFunction } from 'express';
import { PricingUseCases } from '../../application/usecases/PricingUseCases';

export class PricingController {
    constructor(private pricingUseCases: PricingUseCases) {}

    // Pricing Plans
    createPricingPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const plan = await this.pricingUseCases.createPricingPlan(req.body);
            
            res.status(201).json({
                success: true,
                data: plan,
                message: 'Pricing plan created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getAllPricingPlans = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const activeOnly = req.query.activeOnly !== 'false';
            const plans = await this.pricingUseCases.getAllPricingPlans(activeOnly);
            
            res.json({
                success: true,
                data: plans,
                message: 'Pricing plans retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getPricingPlanById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const plan = await this.pricingUseCases.getPricingPlanById(id);
            
            res.json({
                success: true,
                data: plan,
                message: 'Pricing plan retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updatePricingPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const plan = await this.pricingUseCases.updatePricingPlan(id, req.body);
            
            res.json({
                success: true,
                data: plan,
                message: 'Pricing plan updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    deletePricingPlan = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.pricingUseCases.deletePricingPlan(id);
            
            res.json({
                success: true,
                message: 'Pricing plan deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Subscriptions
    createSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { planId, paymentMethodId, trialDays } = req.body;
            
            const result = await this.pricingUseCases.createSubscription(
                tenantId, 
                planId, 
                paymentMethodId, 
                trialDays
            );
            
            res.status(201).json({
                success: true,
                data: result,
                message: 'Subscription created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const subscription = await this.pricingUseCases.getSubscriptionByTenantId(tenantId);
            
            res.json({
                success: true,
                data: subscription,
                message: 'Subscription retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { planId } = req.body;
            
            const subscription = await this.pricingUseCases.updateSubscription(tenantId, planId);
            
            res.json({
                success: true,
                data: subscription,
                message: 'Subscription updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { cancelAtPeriodEnd = true } = req.body;
            
            const subscription = await this.pricingUseCases.cancelSubscription(tenantId, cancelAtPeriodEnd);
            
            res.json({
                success: true,
                data: subscription,
                message: 'Subscription canceled successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    reactivateSubscription = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const subscription = await this.pricingUseCases.reactivateSubscription(tenantId);
            
            res.json({
                success: true,
                data: subscription,
                message: 'Subscription reactivated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Usage & Limits
    getUsageMetrics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const usage = await this.pricingUseCases.updateUsageMetrics(tenantId);
            
            res.json({
                success: true,
                data: usage,
                message: 'Usage metrics retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    checkUsageLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.pricingUseCases.checkUsageLimits(tenantId);
            
            res.json({
                success: true,
                data: result,
                message: 'Usage limits checked successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Billing
    getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.pricingUseCases.getPaymentHistory(tenantId, page, limit);
            
            res.json({
                success: true,
                data: {
                    ...result,
                    pages: Math.ceil(result.total / limit)
                },
                message: 'Payment history retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    createBillingPortalSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { returnUrl } = req.body;
            
            const portalUrl = await this.pricingUseCases.createBillingPortalSession(tenantId, returnUrl);
            
            res.json({
                success: true,
                data: { url: portalUrl },
                message: 'Billing portal session created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Webhooks
    handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signature = req.headers['stripe-signature'] as string;
            const payload = req.body;

            // Verify webhook signature
            const StripeService = require('../../infrastructure/services/StripeService').StripeService;
            const stripeService = new StripeService();
            const event = stripeService.verifyWebhookSignature(payload, signature);

            // Process the event
            await this.pricingUseCases.handleStripeWebhook(event);
            
            res.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(400).json({ error: 'Webhook signature verification failed' });
        }
    };
}