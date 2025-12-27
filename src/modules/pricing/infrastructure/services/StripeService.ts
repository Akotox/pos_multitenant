import Stripe from 'stripe';
import { PricingPlan, Subscription, PaymentRecord } from '../../domain/entities/PricingPlan';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2023-10-16'
        });
    }

    // Customer Management
    async createCustomer(tenantId: string, email: string, name: string): Promise<Stripe.Customer> {
        return await this.stripe.customers.create({
            email,
            name,
            metadata: {
                tenantId
            }
        });
    }

    async getCustomer(customerId: string): Promise<Stripe.Customer> {
        return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    }

    async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
        return await this.stripe.customers.update(customerId, data);
    }

    // Product and Price Management
    async createProduct(plan: PricingPlan): Promise<Stripe.Product> {
        return await this.stripe.products.create({
            name: plan.name,
            description: plan.description,
            metadata: {
                planId: plan.id!
            }
        });
    }

    async createPrice(productId: string, plan: PricingPlan): Promise<Stripe.Price> {
        const interval = plan.billingInterval === 'MONTHLY' ? 'month' : 'year';
        
        return await this.stripe.prices.create({
            product: productId,
            unit_amount: plan.price,
            currency: plan.currency.toLowerCase(),
            recurring: {
                interval
            },
            metadata: {
                planId: plan.id!
            }
        });
    }

    async updatePrice(priceId: string, data: Stripe.PriceUpdateParams): Promise<Stripe.Price> {
        return await this.stripe.prices.update(priceId, data);
    }

    // Subscription Management
    async createSubscription(
        customerId: string, 
        priceId: string, 
        trialDays?: number
    ): Promise<Stripe.Subscription> {
        const params: Stripe.SubscriptionCreateParams = {
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent']
        };

        if (trialDays && trialDays > 0) {
            params.trial_period_days = trialDays;
        }

        return await this.stripe.subscriptions.create(params);
    }

    async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice', 'customer', 'items.data.price.product']
        });
    }

    async updateSubscription(
        subscriptionId: string, 
        data: Stripe.SubscriptionUpdateParams
    ): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.update(subscriptionId, data);
    }

    async cancelSubscription(
        subscriptionId: string, 
        cancelAtPeriodEnd: boolean = true
    ): Promise<Stripe.Subscription> {
        if (cancelAtPeriodEnd) {
            return await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true
            });
        } else {
            return await this.stripe.subscriptions.cancel(subscriptionId);
        }
    }

    async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });
    }

    // Payment Intent Management
    async createPaymentIntent(
        amount: number, 
        currency: string, 
        customerId: string,
        metadata?: Record<string, string>
    ): Promise<Stripe.PaymentIntent> {
        return await this.stripe.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            customer: customerId,
            automatic_payment_methods: { enabled: true },
            metadata
        });
    }

    async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
        return await this.stripe.paymentIntents.confirm(paymentIntentId);
    }

    async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
        return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    }

    // Invoice Management
    async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        return await this.stripe.invoices.retrieve(invoiceId);
    }

    async createInvoice(customerId: string, items: Stripe.InvoiceItemCreateParams[]): Promise<Stripe.Invoice> {
        // Create invoice items
        for (const item of items) {
            await this.stripe.invoiceItems.create({
                ...item,
                customer: customerId
            });
        }

        // Create and finalize invoice
        const invoice = await this.stripe.invoices.create({
            customer: customerId,
            auto_advance: true
        });

        return await this.stripe.invoices.finalizeInvoice(invoice.id);
    }

    // Payment Method Management
    async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
        return await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId
        });
    }

    async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
        return await this.stripe.paymentMethods.detach(paymentMethodId);
    }

    async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
        const paymentMethods = await this.stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        });
        return paymentMethods.data;
    }

    // Refund Management
    async createRefund(
        paymentIntentId: string, 
        amount?: number, 
        reason?: Stripe.RefundCreateParams.Reason
    ): Promise<Stripe.Refund> {
        const params: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId
        };

        if (amount) params.amount = amount;
        if (reason) params.reason = reason;

        return await this.stripe.refunds.create(params);
    }

    // Webhook signature verification
    verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    }

    // Usage-based billing (for API calls, storage, etc.)
    async createUsageRecord(
        subscriptionItemId: string, 
        quantity: number, 
        timestamp?: number
    ): Promise<Stripe.UsageRecord> {
        return await this.stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
            quantity,
            timestamp: timestamp || Math.floor(Date.now() / 1000),
            action: 'increment'
        });
    }

    // Billing portal
    async createBillingPortalSession(
        customerId: string, 
        returnUrl: string
    ): Promise<Stripe.BillingPortal.Session> {
        return await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl
        });
    }

    // Checkout session for one-time payments or subscription setup
    async createCheckoutSession(
        customerId: string,
        priceId: string,
        successUrl: string,
        cancelUrl: string,
        mode: 'payment' | 'subscription' = 'subscription'
    ): Promise<Stripe.Checkout.Session> {
        const params: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            payment_method_types: ['card'],
            mode,
            success_url: successUrl,
            cancel_url: cancelUrl
        };

        if (mode === 'subscription') {
            params.line_items = [{
                price: priceId,
                quantity: 1
            }];
        } else {
            params.line_items = [{
                price: priceId,
                quantity: 1
            }];
        }

        return await this.stripe.checkout.sessions.create(params);
    }
}