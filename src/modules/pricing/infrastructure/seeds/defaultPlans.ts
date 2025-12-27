import { PricingPlan, BillingInterval, SupportLevel } from '../../domain/entities/PricingPlan';

export const defaultPricingPlans: Partial<PricingPlan>[] = [
    {
        name: 'Starter',
        description: 'Perfect for small businesses just getting started',
        price: 2900, // $29.00 per month
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        features: [
            { name: 'Basic POS System', description: 'Core point of sale functionality', included: true },
            { name: 'Product Management', description: 'Add and manage your products', included: true },
            { name: 'Sales Tracking', description: 'Track your daily sales', included: true },
            { name: 'Basic Reports', description: 'Essential sales and inventory reports', included: true },
            { name: 'Email Support', description: 'Get help via email', included: true },
            { name: 'Multi-location', description: 'Manage multiple store locations', included: false },
            { name: 'Advanced Analytics', description: 'Detailed business insights', included: false },
            { name: 'API Access', description: 'Integrate with third-party systems', included: false },
            { name: 'Custom Reports', description: 'Create custom business reports', included: false }
        ],
        limits: {
            maxUsers: 2,
            maxProducts: 500,
            maxSalesPerMonth: 1000,
            maxStorageGB: 1,
            apiCallsPerMonth: 0,
            supportLevel: SupportLevel.BASIC,
            customReports: false,
            multiLocation: false,
            advancedAnalytics: false,
            integrations: ['basic-accounting']
        },
        isActive: true,
        isPopular: false
    },
    {
        name: 'Professional',
        description: 'Ideal for growing businesses with multiple users',
        price: 7900, // $79.00 per month
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        features: [
            { name: 'Advanced POS System', description: 'Full-featured point of sale', included: true },
            { name: 'Product Management', description: 'Unlimited product management', included: true },
            { name: 'Sales Tracking', description: 'Comprehensive sales tracking', included: true },
            { name: 'Advanced Reports', description: 'Detailed sales and inventory reports', included: true },
            { name: 'Priority Support', description: 'Email and chat support', included: true },
            { name: 'Multi-location', description: 'Manage up to 3 store locations', included: true, limit: 3 },
            { name: 'Advanced Analytics', description: 'Detailed business insights', included: true },
            { name: 'API Access', description: 'Basic API integration', included: true },
            { name: 'Custom Reports', description: 'Create custom business reports', included: true }
        ],
        limits: {
            maxUsers: 10,
            maxProducts: 5000,
            maxSalesPerMonth: 10000,
            maxStorageGB: 10,
            apiCallsPerMonth: 10000,
            supportLevel: SupportLevel.STANDARD,
            customReports: true,
            multiLocation: true,
            advancedAnalytics: true,
            integrations: ['basic-accounting', 'quickbooks', 'mailchimp']
        },
        isActive: true,
        isPopular: true
    },
    {
        name: 'Enterprise',
        description: 'For large businesses with advanced needs',
        price: 19900, // $199.00 per month
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        features: [
            { name: 'Enterprise POS System', description: 'Full enterprise-grade POS', included: true },
            { name: 'Unlimited Products', description: 'No limits on product management', included: true },
            { name: 'Advanced Sales Tracking', description: 'Enterprise sales tracking', included: true },
            { name: 'Custom Reports', description: 'Unlimited custom reports', included: true },
            { name: 'Dedicated Support', description: 'Phone, email, and chat support', included: true },
            { name: 'Unlimited Locations', description: 'Manage unlimited store locations', included: true },
            { name: 'Advanced Analytics', description: 'Enterprise business intelligence', included: true },
            { name: 'Full API Access', description: 'Complete API integration', included: true },
            { name: 'White-label Options', description: 'Brand the system as your own', included: true }
        ],
        limits: {
            maxUsers: 100,
            maxProducts: 50000,
            maxSalesPerMonth: 100000,
            maxStorageGB: 100,
            apiCallsPerMonth: 100000,
            supportLevel: SupportLevel.PREMIUM,
            customReports: true,
            multiLocation: true,
            advancedAnalytics: true,
            integrations: [
                'basic-accounting', 
                'quickbooks', 
                'xero', 
                'mailchimp', 
                'shopify', 
                'woocommerce',
                'salesforce',
                'hubspot'
            ]
        },
        isActive: true,
        isPopular: false
    },
    {
        name: 'Starter Annual',
        description: 'Starter plan with annual billing (2 months free)',
        price: 29000, // $290.00 per year (equivalent to $24.17/month)
        currency: 'USD',
        billingInterval: BillingInterval.YEARLY,
        features: [
            { name: 'Basic POS System', description: 'Core point of sale functionality', included: true },
            { name: 'Product Management', description: 'Add and manage your products', included: true },
            { name: 'Sales Tracking', description: 'Track your daily sales', included: true },
            { name: 'Basic Reports', description: 'Essential sales and inventory reports', included: true },
            { name: 'Email Support', description: 'Get help via email', included: true },
            { name: 'Multi-location', description: 'Manage multiple store locations', included: false },
            { name: 'Advanced Analytics', description: 'Detailed business insights', included: false },
            { name: 'API Access', description: 'Integrate with third-party systems', included: false },
            { name: 'Custom Reports', description: 'Create custom business reports', included: false }
        ],
        limits: {
            maxUsers: 2,
            maxProducts: 500,
            maxSalesPerMonth: 1000,
            maxStorageGB: 1,
            apiCallsPerMonth: 0,
            supportLevel: SupportLevel.BASIC,
            customReports: false,
            multiLocation: false,
            advancedAnalytics: false,
            integrations: ['basic-accounting']
        },
        isActive: true,
        isPopular: false
    },
    {
        name: 'Professional Annual',
        description: 'Professional plan with annual billing (2 months free)',
        price: 79000, // $790.00 per year (equivalent to $65.83/month)
        currency: 'USD',
        billingInterval: BillingInterval.YEARLY,
        features: [
            { name: 'Advanced POS System', description: 'Full-featured point of sale', included: true },
            { name: 'Product Management', description: 'Unlimited product management', included: true },
            { name: 'Sales Tracking', description: 'Comprehensive sales tracking', included: true },
            { name: 'Advanced Reports', description: 'Detailed sales and inventory reports', included: true },
            { name: 'Priority Support', description: 'Email and chat support', included: true },
            { name: 'Multi-location', description: 'Manage up to 3 store locations', included: true, limit: 3 },
            { name: 'Advanced Analytics', description: 'Detailed business insights', included: true },
            { name: 'API Access', description: 'Basic API integration', included: true },
            { name: 'Custom Reports', description: 'Create custom business reports', included: true }
        ],
        limits: {
            maxUsers: 10,
            maxProducts: 5000,
            maxSalesPerMonth: 10000,
            maxStorageGB: 10,
            apiCallsPerMonth: 10000,
            supportLevel: SupportLevel.STANDARD,
            customReports: true,
            multiLocation: true,
            advancedAnalytics: true,
            integrations: ['basic-accounting', 'quickbooks', 'mailchimp']
        },
        isActive: true,
        isPopular: true
    }
];